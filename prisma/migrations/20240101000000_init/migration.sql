CREATE TABLE "CourseItem" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DOUBLE PRECISION,
    "categorie" TEXT NOT NULL DEFAULT 'Autre',
    "coche" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourseItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tache" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "lieu" TEXT,
    "priorite" TEXT NOT NULL DEFAULT 'normale',
    "assigneA" TEXT,
    "dateLimite" TIMESTAMP(3),
    "completee" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tache_pkey" PRIMARY KEY ("id")
);
