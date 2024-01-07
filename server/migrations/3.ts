import * as sqlite from "sqlite";

export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 4;
    CREATE TABLE "tokenImages" (
      "id" INTEGER NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "sha256" BLOB NOT NULL,
      "sourceSha256" BLOB,
      "extension" TEXT NOT NULL,
      "createdAt" INT NOT NULL
    );
    CREATE UNIQUE INDEX "index_tokenImages_sha256" ON "tokenImages" ("sha256");

    CREATE TABLE "users" (
      "userID" TEXT NOT NULL PRIMARY KEY,
      "playerName" TEXT,
      "role" TEXT,
      "status" BOOLEAN DEFAULT true
    );

    CREATE TABLE character_data (
      ac TEXT,
      additionalFeatures TEXT,
      additionalFeatures2 TEXT,
      age TEXT,
      alignment TEXT,
      allies TEXT,
      allies2 TEXT,
      appearance TEXT,
      -- Add a column for a list of texts
      attacks TEXT,
      attacksText TEXT,
      background TEXT,
      backstory TEXT,
      bonds TEXT,
      -- Add a column for a list of texts
      cantrips TEXT,

      cha TEXT,
      chaSave TEXT,
      chaSavechecked BOOLEAN,
      classLevel TEXT,
      con TEXT,
      conSave TEXT,
      conSavechecked BOOLEAN,
      cp TEXT,
      dciNo TEXT,
      deathsaveFailures TEXT,
      deathsaveSuccesses TEXT,
      dex TEXT,
      dexSave TEXT,
      dexSavechecked BOOLEAN,
      ep TEXT,
      equipment TEXT,
      equipment2 TEXT,
      eyes TEXT,
      faction TEXT,
      factionImg TEXT,
      factionRank TEXT,
      featuresTraits TEXT,
      flaws TEXT,
      gp TEXT,
      hair TEXT,
      height TEXT,
      hitDice TEXT,
      hitDiceMax TEXT,
      hp TEXT,
      ideals TEXT,
      init TEXT,
      inspiration TEXT,
      int TEXT,
      intSave TEXT,
      intSavechecked BOOLEAN,

      lvl1SpellSlotsTotal TEXT,
      lvl1SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl1Spells TEXT,

      lvl2SpellSlotsTotal TEXT,
      lvl2SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl2Spells TEXT,

      -- 

      lvl3SpellSlotsTotal TEXT,
      lvl3SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl3Spells TEXT,

      lvl4SpellSlotsTotal TEXT,
      lvl4SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl4Spells TEXT,

      lvl5SpellSlotsTotal TEXT,
      lvl5SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl5Spells TEXT,

      lvl6SpellSlotsTotal TEXT,
      lvl6SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl6Spells TEXT,

      lvl7SpellSlotsTotal TEXT,
      lvl7SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl7Spells TEXT,

      lvl8SpellSlotsTotal TEXT,
      lvl8SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl8Spells TEXT,

      lvl9SpellSlotsTotal TEXT,
      lvl9SpellSlotsUsed TEXT,
      -- Add a column for a list of texts
      lvl9Spells TEXT,

      maxHp TEXT,
      name TEXT,
      otherProficiencies TEXT,
      passivePerception TEXT,
      personalityTraits TEXT,
      playerName TEXT,
      pp TEXT,
      preparedSpellsTotal TEXT,
      proficiencyBonus TEXT,
      race TEXT,
      skillAcrobatics TEXT,
      skillAcrobaticschecked BOOLEAN,
      skillAnimalHandling TEXT,

      skillAnimalHandlingchecked BOOLEAN,
      skillArcana TEXT,
      skillArcanachecked BOOLEAN,
      skillAthletics TEXT,
      skillAthleticschecked BOOLEAN,
      skillDeception TEXT,
      skillDeceptionchecked BOOLEAN,
      skillHistory TEXT,
      skillHistorychecked BOOLEAN,
      skillInsight TEXT,
      skillInsightchecked BOOLEAN,

      skillIntimidation TEXT,
      skillIntimidationchecked BOOLEAN,
      skillInvestigation TEXT,
      skillInvestigationchecked BOOLEAN,
      skillMedicine TEXT,
      skillMedicinechecked BOOLEAN,
      skillNature TEXT,
      skillNaturechecked BOOLEAN,
      skillPerception TEXT,
      skillPerceptionchecked BOOLEAN,
      skillPerformance TEXT,
      skillPerformancechecked BOOLEAN,
      skillPersuasion TEXT,
      skillPersuasionchecked BOOLEAN,
      skillReligion TEXT,
      skillReligionchecked BOOLEAN,
      skillSlightOfHand TEXT,
      skillSlightOfHandchecked BOOLEAN,
      skillStealth TEXT,
      skillStealthchecked BOOLEAN,
      skillSurvival TEXT,
      skillSurvivalchecked BOOLEAN,
      skin TEXT,
      sp TEXT,
      speed TEXT,
      spellAttackBonus TEXT,
      spellSaveDC TEXT,
      spellcastingClass TEXT,
      str TEXT,
      strSave TEXT,
      strSavechecked BOOLEAN,
      tempHp TEXT,
      totalNonConsumableMagicItems TEXT,
      treasure TEXT,
      treasure2 TEXT,
      weight TEXT,
      wis TEXT,
      wisSave TEXT,
      wisSavechecked BOOLEAN,
      xp TEXT,

      is_locked BOOLEAN DEFAULT false,
      userID TEXT PRIMARY KEY,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Added createdAt timestamp
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Added updatedAt timestamp
    );    
    COMMIT;
  `);
};
