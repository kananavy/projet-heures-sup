DROP PROCEDURE IF EXISTS GenererCoursAuto4;
DELIMITER //

CREATE PROCEDURE GenererCoursAuto4()
BEGIN
  -- DECLAREs (TOUTES au début)
  DECLARE fini INT DEFAULT 0;
  DECLARE idE INT;
  DECLARE nomE VARCHAR(255);
  DECLARE mentionE VARCHAR(255);
  DECLARE parcoursE VARCHAR(255);
  DECLARE niveauE VARCHAR(255);
  DECLARE ueE VARCHAR(255);
  DECLARE ecE VARCHAR(255);
  DECLARE volumeE FLOAT;

  DECLARE startDate DATE DEFAULT '2022-10-03';
  DECLARE endDate DATE DEFAULT '2023-08-31';
  DECLARE startMaster DATE DEFAULT '2023-02-01'; -- début M1/M2

  DECLARE existHours FLOAT;
  DECLARE restante INT;

  DECLARE d DATE;
  DECLARE dureeC INT;
  DECLARE hSlotStart INT;
  DECLARE hdeb TIME;
  DECLARE hfin TIME;
  DECLARE typeC VARCHAR(3);

  DECLARE attempts INT;
  DECLARE maxAttempts INT DEFAULT 8;

  DECLARE cur CURSOR FOR
    SELECT id, nom, mention, parcours, niveau, ue, ec, volumeHoraire
    FROM Enseignants
    ORDER BY id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET fini = 1;

  OPEN cur;

  boucle_enseignant: LOOP
    FETCH cur INTO idE, nomE, mentionE, parcoursE, niveauE, ueE, ecE, volumeE;
    IF fini = 1 THEN
      LEAVE boucle_enseignant;
    END IF;

    -- total déjà programmé sur la période (L1..M2 inclus mais on respectera startMaster plus bas)
    SELECT COALESCE(SUM(`Durée`),0) INTO existHours
      FROM Cours
      WHERE enseignantId = idE
        AND `Date` BETWEEN startDate AND endDate;

    SET restante = GREATEST(0, CEIL(volumeE - existHours)); -- heures entières restantes

    -- si rien à planifier => passer au suivant
    IF restante <= 0 THEN
      ITERATE boucle_enseignant;
    END IF;

    SET d = startDate;

    boucle_date: WHILE restante > 0 AND d <= endDate DO
      -- ignorer dimanches/jours fériés
      IF NOT EstJourOuvrable(d) THEN
        SET d = DATE_ADD(d, INTERVAL 1 DAY);
        ITERATE boucle_date;
      END IF;

      -- pour M1/M2, ne pas planifier avant startMaster
      IF niveauE IN ('M1','M2') AND d < startMaster THEN
        SET d = DATE_ADD(d, INTERVAL 1 DAY);
        ITERATE boucle_date;
      END IF;

      -- Solofo uniquement le samedi
      IF nomE = 'RANDRIANJAFY Solofo Théodore' AND DAYOFWEEK(d) <> 7 THEN
        SET d = DATE_ADD(d, INTERVAL 1 DAY);
        ITERATE boucle_date;
      END IF;

      -- autres enseignants: autorisés du lundi(2) au samedi(7)
      IF nomE <> 'RANDRIANJAFY Solofo Théodore' AND NOT (DAYOFWEEK(d) BETWEEN 2 AND 7) THEN
        SET d = DATE_ADD(d, INTERVAL 1 DAY);
        ITERATE boucle_date;
      END IF;

      -- On tente plusieurs insertions dans la même journée jusqu'à ne plus pouvoir ou restante = 0
      SET attempts = 0;

      boucle_essai: LOOP
        -- stopper si plus d'heures à planifier ou trop d'essais
        IF restante <= 0 OR attempts >= maxAttempts THEN
          LEAVE boucle_essai;
        END IF;

        SET attempts = attempts + 1;

        -- choisir durée candidate (2..5), ne pas dépasser restante
        SET dureeC = FLOOR(2 + RAND() * 4); -- 2..5
        IF dureeC > restante THEN
          SET dureeC = LEAST(5, GREATEST(2, restante));
        END IF;

        -- tenter emplacement: prioriser matin si possible
        SET hdeb = NULL;
        SET hfin = NULL;

        -- Calcul plage matin : startMin=8, startMax = 12 - dureeC
        IF (12 - dureeC) >= 8 THEN
          SET hSlotStart = 8 + FLOOR(RAND() * ( (12 - dureeC) - 8 + 1 ));
          SET hdeb = MAKETIME(hSlotStart,0,0);
          SET hfin = ADDTIME(hdeb, SEC_TO_TIME(dureeC * 3600));
          -- si chevauche pause (12:00) alors invalid
          IF (hdeb < '12:00:00' AND hfin > '12:00:00') THEN
            SET hdeb = NULL;
            SET hfin = NULL;
          END IF;
        END IF;

        -- si matin invalide, tenter après-midi
        IF hdeb IS NULL THEN
          IF (18 - dureeC) >= 13 THEN
            SET hSlotStart = 13 + FLOOR(RAND() * ( (18 - dureeC) - 13 + 1 ));
            SET hdeb = MAKETIME(hSlotStart,0,0);
            SET hfin = ADDTIME(hdeb, SEC_TO_TIME(dureeC * 3600));
          ELSE
            -- pas d'espace cet jour pour cette durée, réduire si possible
            IF dureeC > 2 THEN
              SET dureeC = dureeC - 1;
              ITERATE boucle_essai;
            ELSE
              -- durée minimale 2 introuvable, on abandonne ce jour
              LEAVE boucle_essai;
            END IF;
          END IF;
        END IF;

        -- sécurité: ne pas dépasser 18:00
        IF hfin > '18:00:00' THEN
          SET hfin = '18:00:00';
          SET dureeC = FLOOR(TIME_TO_SEC(TIMEDIFF(hfin, hdeb)) / 3600);
          IF dureeC < 2 THEN
            -- durée trop courte après ajustement => retenter / réduire
            ITERATE boucle_essai;
          END IF;
          -- recalc hfin exact
          SET hfin = ADDTIME(hdeb, SEC_TO_TIME(dureeC * 3600));
        END IF;

        -- Vérifier chevauchement pour l'enseignant ce jour
        IF (SELECT COUNT(*) FROM Cours
            WHERE enseignantId = idE
              AND `Date` = d
              AND NOT ( `Heure fin` <= hdeb OR `Heure début` >= hfin )
           ) > 0 THEN
          ITERATE boucle_essai; -- essai suivant
        END IF;

        -- Vérifier chevauchement pour le groupe Mention+Parcours+Niveau
        IF (SELECT COUNT(*) FROM Cours
            WHERE `Date` = d
              AND Mention = mentionE
              AND Parcours = parcoursE
              AND Niveau = niveauE
              AND NOT ( `Heure fin` <= hdeb OR `Heure début` >= hfin )
           ) > 0 THEN
          ITERATE boucle_essai; -- essai suivant
        END IF;

        -- Tout OK: déterminer type ET 85% / ED 15%
        IF RAND() < 0.85 THEN
          SET typeC = 'ET';
        ELSE
          SET typeC = 'ED';
        END IF;

        -- Insérer le cours
        INSERT INTO Cours
          (`TYPE`, `Date`, `Heure début`, `Heure fin`, `Mention`, `Parcours`, `Niveau`, `UE`, `EC`, `Durée`, `Enseignant`, `enseignantId`, `Saisie`)
        VALUES
          (typeC, d, hdeb, hfin, mentionE, parcoursE, niveauE, ueE, ecE, dureeC, nomE, idE, 'Saisie');

        -- Mettre à jour les compteurs
        SET restante = restante - dureeC;
        IF restante <= 0 THEN
          LEAVE boucle_essai;
        END IF;

        -- On peut tenter un autre créneau le même jour (boucle_essai continue)
      END LOOP boucle_essai;

      -- passer au jour suivant
      SET d = DATE_ADD(d, INTERVAL 1 DAY);
    END WHILE boucle_date;

    -- passe au prochain enseignant
  END LOOP boucle_enseignant;

  CLOSE cur;
END;
//
DELIMITER ;

-- Appel
CALL GenererCoursAuto4();
