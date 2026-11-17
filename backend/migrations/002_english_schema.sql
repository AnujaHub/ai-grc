-- Consolidate the legacy French schema into the English schema in place.
--
-- Safety rules:
--   * No table or row is dropped.
--   * A populated French table may replace only an empty English duplicate.
--   * If both copies contain rows, the migration aborts instead of guessing.
--   * Empty duplicate tables are retained with a *_empty_duplicate name.
--   * Foreign keys are repaired when an empty English duplicate is promoted.
--
-- Run this migration before 003_email_verification.sql.

DO $$
DECLARE
    pair RECORD;
    old_exists BOOLEAN;
    new_exists BOOLEAN;
    old_count BIGINT;
    new_count BIGINT;
    backup_name TEXT;
    old_target REGCLASS;
    new_target REGCLASS;
    fk RECORD;
    definition TEXT;
BEGIN
    FOR pair IN
        SELECT *
        FROM (VALUES
            ('organisations', 'organizations'),
            ('referentiels', 'frameworks'),
            ('chapitres', 'chapters'),
            ('utilisateurs', 'users'),
            ('systemes_ia', 'ai_systems'),
            ('configurations_risque', 'risk_configurations'),
            ('reponses', 'responses'),
            ('risques', 'risks'),
            ('actions_correctives', 'corrective_actions'),
            ('preuves', 'evidence'),
            ('rapports', 'reports'),
            ('journal_audit', 'audit_logs')
        ) AS pairs(old_name, new_name)
    LOOP
        old_exists := to_regclass(format('public.%I', pair.old_name)) IS NOT NULL;
        new_exists := to_regclass(format('public.%I', pair.new_name)) IS NOT NULL;

        IF NOT old_exists THEN
            CONTINUE;
        END IF;

        EXECUTE format('SELECT count(*) FROM public.%I', pair.old_name) INTO old_count;

        IF NOT new_exists THEN
            EXECUTE format(
                'ALTER TABLE public.%I RENAME TO %I',
                pair.old_name,
                pair.new_name
            );
            CONTINUE;
        END IF;

        EXECUTE format('SELECT count(*) FROM public.%I', pair.new_name) INTO new_count;

        IF old_count > 0 AND new_count > 0 THEN
            RAISE EXCEPTION
                'Migration blocked: both public.% and public.% contain rows. Review and merge this pair manually.',
                pair.old_name,
                pair.new_name;
        ELSIF old_count = 0 THEN
            -- Keep the empty legacy table. Any FK targeting it is redirected
            -- to the existing English table below.
            old_target := to_regclass(format('public.%I', pair.old_name));
            new_target := to_regclass(format('public.%I', pair.new_name));

            FOR fk IN
                SELECT
                    child_ns.nspname AS child_schema,
                    child.relname AS child_table,
                    constraint_obj.conname,
                    pg_get_constraintdef(constraint_obj.oid, true) AS constraint_definition
                FROM pg_constraint AS constraint_obj
                JOIN pg_class AS child
                    ON child.oid = constraint_obj.conrelid
                JOIN pg_namespace AS child_ns
                    ON child_ns.oid = child.relnamespace
                WHERE constraint_obj.contype = 'f'
                  AND constraint_obj.confrelid = old_target
            LOOP
                definition := replace(
                    fk.constraint_definition,
                    format('REFERENCES %s', old_target::TEXT),
                    format('REFERENCES %s', new_target::TEXT)
                );
                EXECUTE format(
                    'ALTER TABLE %I.%I DROP CONSTRAINT %I',
                    fk.child_schema,
                    fk.child_table,
                    fk.conname
                );
                EXECUTE format(
                    'ALTER TABLE %I.%I ADD CONSTRAINT %I %s',
                    fk.child_schema,
                    fk.child_table,
                    fk.conname,
                    definition
                );
            END LOOP;
        ELSE
            backup_name := pair.new_name || '__empty_duplicate';
            IF to_regclass(format('public.%I', backup_name)) IS NOT NULL THEN
                RAISE EXCEPTION
                    'Migration blocked: backup table public.% already exists.',
                    backup_name;
            END IF;

            -- Preserve the empty English table, then promote the populated
            -- French table. PostgreSQL keeps the original table metadata.
            EXECUTE format(
                'ALTER TABLE public.%I RENAME TO %I',
                pair.new_name,
                backup_name
            );
            EXECUTE format(
                'ALTER TABLE public.%I RENAME TO %I',
                pair.old_name,
                pair.new_name
            );

            -- FKs that targeted the empty English table now target its
            -- preserved backup and must point to the promoted table instead.
            old_target := to_regclass(format('public.%I', backup_name));
            new_target := to_regclass(format('public.%I', pair.new_name));

            FOR fk IN
                SELECT
                    child_ns.nspname AS child_schema,
                    child.relname AS child_table,
                    constraint_obj.conname,
                    pg_get_constraintdef(constraint_obj.oid, true) AS constraint_definition
                FROM pg_constraint AS constraint_obj
                JOIN pg_class AS child
                    ON child.oid = constraint_obj.conrelid
                JOIN pg_namespace AS child_ns
                    ON child_ns.oid = child.relnamespace
                WHERE constraint_obj.contype = 'f'
                  AND constraint_obj.confrelid = old_target
            LOOP
                definition := replace(
                    fk.constraint_definition,
                    format('REFERENCES %s', old_target::TEXT),
                    format('REFERENCES %s', new_target::TEXT)
                );
                EXECUTE format(
                    'ALTER TABLE %I.%I DROP CONSTRAINT %I',
                    fk.child_schema,
                    fk.child_table,
                    fk.conname
                );
                EXECUTE format(
                    'ALTER TABLE %I.%I ADD CONSTRAINT %I %s',
                    fk.child_schema,
                    fk.child_table,
                    fk.conname,
                    definition
                );
            END LOOP;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE
    rename_pair RECORD;
BEGIN
    FOR rename_pair IN
        SELECT *
        FROM (VALUES
            ('organizations', 'nom', 'name'),
            ('organizations', 'secteur', 'sector'),
            ('organizations', 'pays', 'country'),
            ('organizations', 'date_creation', 'created_at'),
            ('frameworks', 'nom', 'name'),
            ('frameworks', 'statut', 'status'),
            ('chapters', 'referentiel_id', 'framework_id'),
            ('chapters', 'numero', 'number'),
            ('chapters', 'titre', 'title'),
            ('chapters', 'ordre', 'sort_order'),
            ('clauses', 'chapitre_id', 'chapter_id'),
            ('clauses', 'numero', 'number'),
            ('clauses', 'titre', 'title'),
            ('clauses', 'type_exigence', 'requirement_type'),
            ('clauses', 'ordre', 'sort_order'),
            ('clauses', 'type_evaluation', 'evaluation_type'),
            ('clauses', 'departement_suggere', 'suggested_department'),
            ('risk_configurations', 'organisation_id', 'organization_id'),
            ('risk_configurations', 'niveaux_impact', 'impact_levels'),
            ('risk_configurations', 'niveaux_probabilite', 'probability_levels'),
            ('ai_systems', 'nom', 'name'),
            ('ai_systems', 'proprietaire', 'owner'),
            ('ai_systems', 'domaine_utilisation', 'usage_domain'),
            ('ai_systems', 'niveau_criticite', 'criticality_level'),
            ('ai_systems', 'statut', 'status'),
            ('ai_systems', 'organisation_id', 'organization_id'),
            ('users', 'nom', 'name'),
            ('users', 'prenom', 'first_name'),
            ('users', 'mot_de_passe', 'password_hash'),
            ('users', 'organisation_id', 'organization_id'),
            ('users', 'statut', 'status'),
            ('users', 'date_creation', 'created_at'),
            ('evaluations', 'type_evaluation', 'evaluation_type'),
            ('evaluations', 'systeme_ia_id', 'ai_system_id'),
            ('evaluations', 'organisation_id', 'organization_id'),
            ('evaluations', 'referentiel_id', 'framework_id'),
            ('evaluations', 'responsable_id', 'responsible_id'),
            ('evaluations', 'date_debut', 'start_date'),
            ('evaluations', 'date_fin', 'end_date'),
            ('evaluations', 'statut', 'status'),
            ('evaluations', 'commentaire', 'comment'),
            ('audit_logs', 'utilisateur_id', 'user_id'),
            ('audit_logs', 'utilisateur_email', 'user_email'),
            ('audit_logs', 'ressource_type', 'resource_type'),
            ('audit_logs', 'ressource_id', 'resource_id'),
            ('audit_logs', 'date_action', 'action_at'),
            ('reports', 'date_generation', 'generated_at'),
            ('reports', 'score_global', 'overall_score'),
            ('reports', 'chemin_fichier', 'file_path'),
            ('responses', 'reponse', 'response'),
            ('responses', 'commentaire', 'comment'),
            ('responses', 'date_reponse', 'responded_at'),
            ('responses', 'repondant_id', 'respondent_id'),
            ('risks', 'titre', 'title'),
            ('risks', 'categorie', 'category'),
            ('risks', 'probabilite', 'probability'),
            ('risks', 'niveau_risque', 'risk_level'),
            ('risks', 'statut', 'status'),
            ('risks', 'date_identification', 'identified_at'),
            ('corrective_actions', 'risque_id', 'risk_id'),
            ('corrective_actions', 'titre', 'title'),
            ('corrective_actions', 'responsable_id', 'responsible_id'),
            ('corrective_actions', 'date_echeance', 'due_date'),
            ('corrective_actions', 'statut', 'status'),
            ('corrective_actions', 'date_cloture', 'closed_at'),
            ('evidence', 'reponse_id', 'response_id'),
            ('evidence', 'nom_fichier', 'file_name'),
            ('evidence', 'chemin_fichier', 'file_path'),
            ('evidence', 'type_fichier', 'file_type'),
            ('evidence', 'taille', 'size_bytes'),
            ('evidence', 'date_upload', 'uploaded_at'),
            ('evidence', 'analyse_verdict', 'analysis_verdict'),
            ('evidence', 'analyse_details', 'analysis_details'),
            ('evidence', 'analyse_date', 'analyzed_at')
        ) AS pairs(table_name, old_name, new_name)
    LOOP
        IF to_regclass(format('public.%I', rename_pair.table_name)) IS NULL THEN
            CONTINUE;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = rename_pair.table_name
              AND column_name = rename_pair.old_name
        ) AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = rename_pair.table_name
              AND column_name = rename_pair.new_name
        ) THEN
            RAISE EXCEPTION
                'Migration blocked: public.% contains both columns % and %.',
                rename_pair.table_name,
                rename_pair.old_name,
                rename_pair.new_name;
        ELSIF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = rename_pair.table_name
              AND column_name = rename_pair.old_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE public.%I RENAME COLUMN %I TO %I',
                rename_pair.table_name,
                rename_pair.old_name,
                rename_pair.new_name
            );
        END IF;
    END LOOP;
END $$;

DO $$
BEGIN
    IF to_regclass('public.ix_utilisateurs_email') IS NOT NULL
       AND to_regclass('public.ix_users_email') IS NULL THEN
        ALTER INDEX public.ix_utilisateurs_email RENAME TO ix_users_email;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.users') IS NULL THEN
        RAISE EXCEPTION 'Migration blocked: public.users does not exist.';
    END IF;
END $$;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255),
    ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);

ALTER TABLE public.users
    ALTER COLUMN status TYPE VARCHAR(30);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass
          AND conname = 'users_google_sub_key'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_google_sub_key UNIQUE (google_sub);
    END IF;
END $$;
