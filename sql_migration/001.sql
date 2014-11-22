-- Table: "user"

DROP TABLE IF EXISTS "user";

CREATE TABLE "user"
(
  id uuid NOT NULL,
  name character varying(100) NOT NULL,
  pass character(60) NOT NULL,
  CONSTRAINT pk PRIMARY KEY (id),
  CONSTRAINT unique_name UNIQUE (name)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE "user"
  OWNER TO dan;
