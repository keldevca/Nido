CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

INSERT INTO "Store" ("id", "name")
SELECT gen_random_uuid()::text, "store"
FROM (SELECT DISTINCT "store" FROM "CourseItem" WHERE "store" IS NOT NULL) AS used;
