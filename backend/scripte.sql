DROP TABLE IF EXISTS JoursFeries;
CREATE TABLE JoursFeries (
  date_ferie DATE PRIMARY KEY,
  nom VARCHAR(100)
);

INSERT INTO JoursFeries VALUES
('2022-11-01','Toussaint'),
('2022-12-25','Noël'),
('2023-01-01','Jour de l''An'),
('2023-03-29','Martyrs'),
('2023-04-10','Lundi de Pâques'),
('2023-05-01','Travail'),
('2023-05-18','Ascension'),
('2023-05-25','OUA'),
('2023-06-26','Fête Nationale'),
('2023-08-15','Assomption');



DROP FUNCTION IF EXISTS EstJourOuvrable;
DELIMITER //
CREATE FUNCTION EstJourOuvrable(d DATE)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  IF DAYOFWEEK(d) = 1 THEN
    RETURN FALSE;
  END IF;

  IF (SELECT COUNT(*) FROM JoursFeries WHERE date_ferie = d) > 0 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END//
DELIMITER ;


DROP FUNCTION IF EXISTS HeureAlea;
DELIMITER //
CREATE FUNCTION HeureAlea(minH INT, maxH INT)
RETURNS VARCHAR(5)
DETERMINISTIC
BEGIN
  DECLARE h INT;
  DECLARE m INT;
  SET h = FLOOR(minH + RAND() * (maxH - minH + 1));
  SET m = FLOOR(RAND()*4) * 15;
  RETURN CONCAT(LPAD(h,2,'0'),':',LPAD(m,2,'0'));
END//
DELIMITER ;



DROP PROCEDURE IF EXISTS GenererCoursAuto;
DELIMITER //
CREATE PROCEDURE GenererCoursAuto()
BEGIN
  DECLARE fini INT DEFAULT 0;

  DECLARE idE INT;
  DECLARE nomE VARCHAR(255);
  DECLARE mentionE VARCHAR(255);
  DECLARE parcoursE VARCHAR(255);
  DECLARE niveauE VARCHAR(255);
  DECLARE ueE VARCHAR(255);
  DECLARE ecE VARCHAR(255);
  DECLARE volumeE FLOAT;

  DECLARE d DATE;
  DECLARE hGen FLOAT;
  DECLARE hNeed FLOAT;

  DECLARE typeC VARCHAR(10);
  DECLARE dureeC FLOAT;
  DECLARE hdeb VARCHAR(5);
  DECLARE hfin VARCHAR(5);
  DECLARE hdebInt INT;

  DECLARE cur CURSOR FOR
    SELECT id, nom, mention, parcours, niveau, ue, ec, volumeHoraire FROM Enseignants;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET fini = 1;

  OPEN cur;

  boucle: LOOP
    FETCH cur INTO idE, nomE, mentionE, parcoursE, niveauE, ueE, ecE, volumeE;
    IF fini = 1 THEN LEAVE boucle; END IF;

    SET hGen = 0;
    SET hNeed = volumeE * 1.2;

    SET d = '2022-10-03';

    WHILE hGen < hNeed AND d <= '2023-08-31' DO

      IF EstJourOuvrable(d) THEN

        IF nomE = 'RANDRIANJARY Solofo Theodore' THEN

          IF DAYOFWEEK(d) = 7 THEN

            IF RAND() < 0.8 THEN
              SET typeC = 'ET';
              SET dureeC = 2;
            ELSE
              SET typeC = 'EP';
              SET dureeC = 2.5;
            END IF;

            SET hdeb = HeureAlea(8,14);
            SET hdebInt = SUBSTRING(hdeb,1,2);
            SET hfin = CONCAT(LPAD(hdebInt + FLOOR(dureeC),2,'0'),':',SUBSTRING(hdeb,4,2));

            INSERT INTO Cours
            (TYPE, Date, `Heure début`, `Heure fin`, Mention, Parcours, Niveau, UE, EC, Durée, Enseignant, enseignantId, Saisie)
            VALUES
            (typeC, d, hdeb, hfin, mentionE, parcoursE, niveauE, ueE, ecE, dureeC, nomE, idE, 'Saisie');

            SET hGen = hGen + dureeC;

          END IF;

        ELSE
          IF DAYOFWEEK(d) BETWEEN 2 AND 7 THEN
            IF RAND() < 0.4 THEN

              IF RAND() < 0.8 THEN
                SET typeC = 'ET';
                SET dureeC = 2;
              ELSE
                SET typeC = 'EP';
                SET dureeC = 2.5;
              END IF;

              SET hdeb = HeureAlea(7,15);
              SET hdebInt = SUBSTRING(hdeb,1,2);
              SET hfin = CONCAT(LPAD(hdebInt + FLOOR(dureeC),2,'0'),':',SUBSTRING(hdeb,4,2));

              INSERT INTO Cours
              (TYPE, Date, `Heure début`, `Heure fin`, Mention, Parcours, Niveau, UE, EC, Durée, Enseignant, enseignantId, Saisie)
              VALUES
              (typeC, d, hdeb, hfin, mentionE, parcoursE, niveauE, ueE, ecE, dureeC, nomE, idE, 'Saisie');

              SET hGen = hGen + dureeC;

            END IF;
          END IF;
        END IF;

      END IF;

      SET d = DATE_ADD(d, INTERVAL 1 DAY);

    END WHILE;

  END LOOP;

  CLOSE cur;
END//
DELIMITER ;



CALL GenererCoursAuto();

