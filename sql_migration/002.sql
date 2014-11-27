-- Table: expense

-- DROP TABLE expense;

CREATE TABLE expense
(
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  datetime timestamp without time zone NOT NULL,
  amount numeric(6,2) NOT NULL,
  comment character varying(100),
  description character varying(100),
  CONSTRAINT expense_pkey PRIMARY KEY (id),
  CONSTRAINT expense_user_id_fkey FOREIGN KEY (user_id)
      REFERENCES "user" (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE expense
  OWNER TO dan;
