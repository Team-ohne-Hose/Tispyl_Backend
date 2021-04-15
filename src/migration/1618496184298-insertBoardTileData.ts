import {MigrationInterface, QueryRunner} from "typeorm";

export class insertBoardTileData1618496184298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO User (id, login_name, display_name, time_played, password_hash, last_figure, is_connected, is_dev) VALUES" +
          "(1, 'TISPYL', 'TISPYL', 0, 'c5731c0603405caaf18128d15c4380ad', 1, 0, 0)");
        await queryRunner.query("INSERT INTO language (id, name) VALUES (1, 'Deutsch')");
        await queryRunner.query("INSERT INTO board_tile (id, name, description, languageId, path, userId) VALUES " +
          "(1,'Demokratie','Entscheidet wer trinken muss. Bei Gleichstand trinken beide.',1,'/assets/board/democracy.png', 1)," +
          "(2,'Drinkbuddy','Such dir einen Drinkbuddy.',1,'/assets/board/buddy.png', 1)," +
          "(3,'4 Ever Alone','Alle Singles oder die, die es gerne wären, trinken.',1,'/assets/board/alone.png', 1)," +
          "(4,'Schere, Stein, paar Bier...','Suche dir einen Gegner. Spielt eine Runde Schere, Stein, Papier. Der Verlierer trinkt.',1,'/assets/board/paperScissor.png', 1)," +
          "(5,'Ich hab noch nie...','Stelle eine ICH HAB NOCH NIE.. Aussage. Wer doch schonmal hat trinkt.',1,'/assets/board/neverHIE.png', 1)," +
          "(6,'Regel','Beschließe eine Regel. Du darfst ggf. schon bestehende Regeln auflösen.',1,'/assets/board/rule.png', 1)," +
          "(7,'Gemeinschaft','Alle trinken.',1,'/assets/board/community.png', 1)," +
          "(8,'Würfelglück','Trinke so viele Rationen, wie du Augen auf dem Würfel hast. Würfel nicht nochmal.',1,'/assets/board/diceLuck.png', 1)," +
          "(9,'Titties','Alle Frauen und die, die sich als solche fühlen, trinken.',1,'/assets/board/titties.png', 1)," +
          "(10,'Linksextrem','Dein linker Nachbar trinkt.',1,'/assets/board/leftExtremism.png', 1)," +
          "(11,'Glückspilz','Würfel noch einmal. Führe die nächste Aufgabe trotzdem aus.',1,'/assets/board/lucky.png', 1)," +
          "(12,'Münzwurf','Wirf eine Münze. Bei Kopf trinkst du, bei Zahl darfst du verteilen. (Tipp: /coinflip)',1,'/assets/board/coinflip.png', 1)," +
          "(13,'Ex & Hopp','Leere dein Getränk auf Ex.',1,'/assets/board/exHopp.png', 1)," +
          "(14,'Spendabel','Verteile zwei Rationen.',1,'/assets/board/donor.png', 1)," +
          "(15,'Schwänze','Alle Kerle trinken.',1,'/assets/board/dicks.png', 1)," +
          "(16,'Wasserfall','Alle setzen gleichzeitig ihr Getränk an und trinken. Wenn du aufhörst darf der nächst in der Reihe absetzen usw.',1,'/assets/board/waterfall.png', 1)," +
          "(17,'Wahrheit oder Dicht','Suche dir ein Opfer. Stelle eine Wahrheit oder Pflicht Aufgabe.',1,'/assets/board/truth.png', 1)," +
          "(18,'Kategorie','Suche dir eine Kategorie aus. Jeder sagt reihum einen dazu passenden Begriff. Wer zögert oder nichts weiß, trinkt. Du fängst an.',1,'/assets/board/category.png', 1)," +
          "(19,'Alleingang','Gönn dir eine Ration.',1,'/assets/board/loneSurvivor.png', 1)," +
          "(20,'Senior','Der Älteste trinkt.',1,'/assets/board/senior.png', 1)," +
          "(21,'Heimweg','Auf diesem Feld kannst du rausgeworfen werden. Starte dann von neu.',1,'/assets/board/wayHome.png', 1)," +
          "(22,'Aufsitzen','Entscheidet auf wessen Schoß du dich für eine Runde setzen musst.',1,'/assets/board/mountUp.png', 1)," +
          "(23,'Doppelwort','Reihum sagt jeder eine zusammengesetztes Nomen, welches mit dem Nomen anfängt, mit dem dein Vordermann geendet hat. Du beginnst.',1,'/assets/board/doubleWord.png', 1)," +
          "(24,'Blackout','Verteile für jedes schwarze Kleidungsstück, das du trägst und zeigst, eine Ration. Unterwäsche zählt doppelt.',1,'/assets/board/blackOut.png', 1)," +
          "(25,'Diktatur','Alle trinken, außer dir.',1,'/assets/board/dictator.png', 1)," +
          "(26,'Küsschen (aufs Nüsschen)','Guten Freunden gibt man ein Küsschen. Dein rechter Nachbar ist ein guter Freund. Gibst du ein Küsschen aufs Nüsschen, trinken alle Unbeteiligte drei Rationen.',1,'/assets/board/kisses.png', 1)," +
          "(27,'Neustart','Begib dich zurück zum Start.',1,'/assets/board/restart.png', 1)," +
          "(28,'Dancing Queen','Tanze etwas vor. Allein oder zu zweit.. Wie wärs mit deinem Namen?',1,'/assets/board/dancingQueen.png', 1)," +
          "(29,'Aufstieg','Aufgepasst! Der nächste, der eine Sechs würfelt, zieht einen Ring nach oben.',1,'/assets/board/stepUp.png', 1)," +
          "(30,'Hobbyghor','Entscheidet welches Lied ihr gemeinsam singt.',1,'/assets/board/choir.png', 1)," +
          "(31,'Gefängnis','Setze eine Runde aus. Leere in der Zwischenzeit dein Getränk. Leistet dir jemand Gesellschaft, gelingt euch der Ausbruch sofort.',1,'/assets/board/jail.png', 1)," +
          "(32,'50% Chance','Wenn im nächsten Zug eine ungerade Zahl würfelst, setze sie rückwärts.',1,'/assets/board/chance.png', 1)," +
          "(33,'Fist\\'n\\'Sauf','Gib jemandem eine Brofist. Trink dann mit ihm/ihr.',1,'/assets/board/fistBuddy.png', 1)," +
          "(34,'DJ','Bediene die Musik(Musikbot) bis Ende des Spiels oder bis jemand neues dieses Feld betritt.',1,'/assets/board/butler.png', 1)," +
          "(35,'Sechser im Lotto','Alle trinken eine Ration für jede Sechs in ihrem Geburtsdatum.',1,'/assets/board/sixes.png', 1)," +
          "(36,'Perspektivwechsel','Wechselt die Spielrichtung. (Tipp: /persperciveChange)',1,'/assets/board/perspective.png', 1)," +
          "(37,'Schlusslicht','Der letzte trinkt.',1,'/assets/board/tailLight.png', 1)," +
          "(38,'Abgang','Begib dich ein Feld nach unten. Führe diese Aufgabe trotzdem aus.',1,'/assets/board/descent.png', 1)," +
          "(39,'Striptease','Entledige dich eines primären Kleidungsstücks.',1,'/assets/board/striptease.png', 1)," +
          "(40,'Wechsel dich','Erste und letzte Spielfigur tauschen den Platz.',1,'/assets/board/swapPlaces.png', 1)," +
          "(41,'Dehwurm-r','Suche dir einen Gegenstand. Stütze deinen Kopf darauf und drehe dich zehn Runden um den Gegenstand.',1,'/assets/board/dehwurmr.png', 1)," +
          "(42,'Schwarzes Loch','Betrittst du dieses Feld, werden du und alle Spieler auf den umliegenden vier Feldern zum Start zurück teleportiert.',1,'/assets/board/blackHole.png', 1)," +
          "(43,'Fotoshooting','Schießt ein Foto von allen Spielern und dem Spiel.',1,'/assets/board/fotoshooting.png', 1)," +
          "(44,'7 to Heaven','Alle Spieler strecken ihre Hännde nach oben. Der letzte trinkt.',1,'/assets/board/heaven.png', 1)," +
          "(45,'Jeansparty','Alle die eine Jeans tragen trinken.',1,'/assets/board/jeans.png', 1)," +
          "(46,'Multiple Persönlichkeitsstörung','Gönne dir und deinem zweitem ich eine Ration.',1,'/assets/board/multiple.png', 1)," +
          "(47,'BLGRHÄ - Zungenbrecher','Fischers Fritz fischt frische Fische, frische Fische fischt Fischers Fritz.',1,'/assets/board/blgrha.png', 1)," +
          "(48,'Schildkröte','Du wirst zur Schildkröte. Deine Augenanzahl wird durch zwei geteilt und ggf. aufgerundet.',1,'/assets/board/turtle.png', 1)," +
          "(49,'Akrobatik','Mache einen Handstand oder ein Rad.',1,'/assets/board/acrobatics.png', 1)," +
          "(50,'Rückzug','Setze deinen nächsten Zug zurück.',1,'/assets/board/retreat.png', 1)," +
          "(51,'Auszeit','Tue nichts. Musst du doch etwas tun gilt das als Regelverstoß.',1,'/assets/board/timeout.png', 1)," +
          "(52,'Storytime','Erzähle eine Geschichte. Finden die Anderen sie nicht gut trinkst du eine Strafration.',1,'/assets/board/story.png', 1)," +
          "(53,'Secret Agent','Leere bis zum Ende dees Spiels das Getränk eines anderen. Wirst du vom Getränkebesitzer erwischt trinkst du deins und seins aus.',1,'/assets/board/secretAgent.png', 1)," +
          "(54,'Goethe','Du wirst zum Denker und reimst für eine Runde. Such dir einen Dichter. Dieser trinkt deine Schlücke für eine Runde.',1,'/assets/board/goethe.png', 1)," +
          "(55,'Flaschendrehen','Dreht eine Flasche. Der Auserwählte trinkt. (Tipp: /random <x>)',1,'/assets/board/bottle.png', 1)," +
          "(56,'Ulf','Ulf ein Getränk. Ist kein Ulf vorhanden trinkst du zwei Rationen.',1,'/assets/board/ulf.png', 1)," +
          "(57,'Quallantität','Alle trinken. Der, der am meisten getrunken hat, darf seine getrunkene Anzahl an Rationen verteilen.',1,'/assets/board/jellyfish.png', 1)," +
          "(58,'Junior','Der Jüngste trinkt.',1,'/assets/board/junior.png', 1)," +
          "(59,'Joker','Suche dir ein Feld aus. Führe die Aktion dieses Feldes aus.',1,'/assets/board/joker.png', 1)," +
          "(60,'Lauch','Der Dünnste trinkt.',1,'/assets/board/leek.png', 1)," +
          "(61,'Fake News','Stelle eine These über dich auf. Bei Drei melden sich Alle, die sie für wahr halten. Wer falsch liegt, trinkt. Für Jeden, der richtig liegt, trinkst du.',1,'/assets/board/fakeNews.png', 1)," +
          "(62,'Edward Fortyhands','Du bekommst ein Getränk an jede Hand geklebt. Sie werden erst wieder abgemacht, wenn du sie geleert hast.',1,'/assets/board/edward.png', 1)");
        await queryRunner.query("INSERT INTO tile_set (id, name, authorId) VALUES (1, 'DEFAULT', 1)");
        await queryRunner.query("INSERT INTO set_field (id, tileSetId, fieldNumber, boardTileId, restrictRing, restrictField) VALUES" +
          "(1, 1, 1, 1, -1, -1)," +
          "(2, 1, 2, 2, 12, -1)," +
          "(3, 1, 3, 3, -1, -1)," +
          "(4, 1, 4, 4, -1, -1)," +
          "(5, 1, 5, 5, -1, -1)," +
          "(6, 1, 6, 6, -1, -1)," +
          "(7, 1, 7, 7, -1, -1)," +
          "(8, 1, 8, 8, -1, -1)," +
          "(9, 1, 9, 9, -1, -1)," +
          "(10, 1, 10, 10, -1, -1)," +
          "(11, 1, 11, 11, -1, -1)," +
          "(12, 1, 12, 12, -1, -1)," +
          "(13, 1, 13, 13, -1, -1)," +
          "(14, 1, 14, 14, -1, -1)," +
          "(15, 1, 15, 15, -1, -1)," +
          "(16, 1, 16, 16, -1, -1)," +
          "(17, 1, 17, 17, -1, -1)," +
          "(18, 1, 18, 18, -1, -1)," +
          "(19, 1, 19, 19, -1, -1)," +
          "(20, 1, 20, 20, -1, -1)," +
          "(21, 1, 21, 21, -1, -1)," +
          "(22, 1, 22, 22, -1, -1)," +
          "(23, 1, 23, 23, -1, -1)," +
          "(24, 1, 24, 24, -1, -1)," +
          "(25, 1, 25, 25, -1, -1)," +
          "(26, 1, 26, 26, -1, -1)," +
          "(27, 1, 27, 27, -1, -1)," +
          "(28, 1, 28, 28, -1, -1)," +
          "(29, 1, 29, 29, -1, -1)," +
          "(30, 1, 30, 30, -1, -1)," +
          "(31, 1, 31, 31, -1, -1)," +
          "(32, 1, 32, 32, -1, -1)," +
          "(33, 1, 33, 33, -1, -1)," +
          "(34, 1, 34, 34, -1, -1)," +
          "(35, 1, 35, 35, -1, -1)," +
          "(36, 1, 36, 36, -1, -1)," +
          "(37, 1, 37, 37, -1, -1)," +
          "(38, 1, 38, 38, 234, -1)," +
          "(39, 1, 39, 39, -1, -1)," +
          "(40, 1, 40, 40, -1, -1)," +
          "(41, 1, 41, 41, -1, -1)," +
          "(42, 1, 42, 42, 234, -1)," +
          "(43, 1, 43, 43, -1, -1)," +
          "(44, 1, 44, 44, -1, -1)," +
          "(45, 1, 45, 45, -1, -1)," +
          "(46, 1, 46, 46, -1, -1)," +
          "(47, 1, 47, 47, -1, -1)," +
          "(48, 1, 48, 48, -1, -1)," +
          "(49, 1, 49, 49, -1, -1)," +
          "(50, 1, 50, 50, -1, -1)," +
          "(51, 1, 51, 51, -1, -1)," +
          "(52, 1, 52, 52, -1, -1)," +
          "(53, 1, 53, 53, -1, -1)," +
          "(54, 1, 54, 54, -1, -1)," +
          "(55, 1, 55, 55, -1, -1)," +
          "(56, 1, 56, 56, -1, -1)," +
          "(57, 1, 57, 57, -1, -1)," +
          "(58, 1, 58, 58, -1, -1)," +
          "(59, 1, 59, 59, -1, -1)," +
          "(60, 1, 60, 60, -1, -1)," +
          "(61, 1, 61, 61, -1, -1)," +
          "(62, 1, 62, 62, -1, -1)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM set_field WHERE id BETWEEN 1 AND 62");
        await queryRunner.query("DELETE FROM tile_set WHERE id=1");
        await queryRunner.query("DELETE FROM board_tile WHERE id BETWEEN 1 AND 62");
        await queryRunner.query("DELETE FROM language WHERE id=1");
        await queryRunner.query("DELETE FROM User WHERE id=1");
    }

}
