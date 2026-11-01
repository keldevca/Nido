ALTER TABLE "CourseItem" ADD COLUMN "list" TEXT NOT NULL DEFAULT 'groceries';

ALTER TABLE "Store" ADD COLUMN "list" TEXT NOT NULL DEFAULT 'groceries';

DROP INDEX "Store_name_key";

CREATE UNIQUE INDEX "Store_name_list_key" ON "Store"("name", "list");
