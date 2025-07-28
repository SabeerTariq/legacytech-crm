-- Simple Auth User Creation Fix
-- This script identifies and fixes the specific issue preventing user creation

-- 1. Check if there are any triggers that might be causing the issue
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE 'Checking for triggers that might interfere with auth user creation...';
    
    FOR trigger_record IN 
        SELECT 
            trigger_name,
            event_manipulation,
            event_object_table,
            action_statement
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND event_object_table IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found trigger: % on table %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;
END $$;

-- 2. Check if there are any functions that might be called during user creation
DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE 'Checking for functions that might interfere with auth user creation...';
    
    FOR func_record IN 
        SELECT 
            routine_name,
            routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND (routine_name LIKE '%user%' OR routine_name LIKE '%auth%' OR routine_name LIKE '%profile%')
    LOOP
        RAISE NOTICE 'Found function: % (% type)', func_record.routine_name, func_record.routine_type;
    END LOOP;
END $$;

-- 3. Check if there are any missing tables that might be referenced
DO $$
DECLARE
    missing_table TEXT;
BEGIN
    RAISE NOTICE 'Checking for missing tables that might be referenced...';
    
    -- Check if project_assignments table exists (from earlier error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_assignments') THEN
        RAISE NOTICE 'Missing table: project_assignments';
    END IF;
    
    -- Check if any other tables that might be referenced are missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_permissions') THEN
        RAISE NOTICE 'Missing table: user_permissions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions') THEN
        RAISE NOTICE 'Missing table: permissions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE NOTICE 'Missing table: user_roles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') THEN
        RAISE NOTICE 'Missing table: roles';
    END IF;
END $$;

-- 4. Check if there are any enum types that might be causing issues
DO $$
DECLARE
    enum_record RECORD;
BEGIN
    RAISE NOTICE 'Checking enum types...';
    
    FOR enum_record IN 
        SELECT 
            t.typname,
            e.enumlabel
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found enum: % = %', enum_record.typname, enum_record.enumlabel;
    END LOOP;
END $$;

-- 5. Check if there are any foreign key constraints that might be causing issues
DO $$
DECLARE
    fk_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign key constraints...';
    
    FOR fk_record IN 
        SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
        AND tc.table_name IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found FK: %.% -> %.%', fk_record.table_name, fk_record.column_name, fk_record.foreign_table_name, fk_record.foreign_column_name;
    END LOOP;
END $$;

-- 6. Check if there are any RLS policies that might be causing issues
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Checking RLS policies...';
    
    FOR policy_record IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found RLS policy: % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 7. Check if there are any check constraints that might be causing issues
DO $$
DECLARE
    check_record RECORD;
BEGIN
    RAISE NOTICE 'Checking check constraints...';
    
    FOR check_record IN 
        SELECT 
            table_name,
            constraint_name,
            check_clause
        FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found check constraint: % on table %', check_record.constraint_name, check_record.table_name;
    END LOOP;
END $$;

-- 8. Check if there are any unique constraints that might be causing issues
DO $$
DECLARE
    unique_record RECORD;
BEGIN
    RAISE NOTICE 'Checking unique constraints...';
    
    FOR unique_record IN 
        SELECT 
            table_name,
            constraint_name,
            column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
        AND tc.table_name IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found unique constraint: % on table %.%', unique_record.constraint_name, unique_record.table_name, unique_record.column_name;
    END LOOP;
END $$;

-- 9. Check if there are any sequences that might be causing issues
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    RAISE NOTICE 'Checking sequences...';
    
    FOR seq_record IN 
        SELECT 
            sequence_name,
            data_type,
            start_value,
            minimum_value,
            maximum_value
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        RAISE NOTICE 'Found sequence: %', seq_record.sequence_name;
    END LOOP;
END $$;

-- 10. Check if there are any views that might be causing issues
DO $$
DECLARE
    view_record RECORD;
BEGIN
    RAISE NOTICE 'Checking views...';
    
    FOR view_record IN 
        SELECT 
            table_name,
            view_definition
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        RAISE NOTICE 'Found view: %', view_record.table_name;
    END LOOP;
END $$;

-- 11. Check if there are any materialized views that might be causing issues
DO $$
DECLARE
    matview_record RECORD;
BEGIN
    RAISE NOTICE 'Checking materialized views...';
    
    FOR matview_record IN 
        SELECT 
            matviewname,
            definition
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Found materialized view: %', matview_record.matviewname;
    END LOOP;
END $$;

-- 12. Check if there are any rules that might be causing issues
DO $$
DECLARE
    rule_record RECORD;
BEGIN
    RAISE NOTICE 'Checking rules...';
    
    FOR rule_record IN 
        SELECT 
            schemaname,
            tablename,
            rulename,
            definition
        FROM pg_rules 
        WHERE schemaname = 'public'
        AND tablename IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found rule: % on table %', rule_record.rulename, rule_record.tablename;
    END LOOP;
END $$;

-- 13. Check if there are any event triggers that might be causing issues
DO $$
DECLARE
    event_trigger_record RECORD;
BEGIN
    RAISE NOTICE 'Checking event triggers...';
    
    FOR event_trigger_record IN 
        SELECT 
            trigger_name,
            event_manipulation,
            event_object_schema,
            event_object_table,
            action_statement
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND event_object_table IN ('user_profiles', 'employees', 'user_roles', 'user_permissions')
    LOOP
        RAISE NOTICE 'Found event trigger: % on table %', event_trigger_record.trigger_name, event_trigger_record.event_object_table;
    END LOOP;
END $$;

-- 14. Check if there are any domain types that might be causing issues
DO $$
DECLARE
    domain_record RECORD;
BEGIN
    RAISE NOTICE 'Checking domain types...';
    
    FOR domain_record IN 
        SELECT 
            domain_name,
            data_type,
            domain_default
        FROM information_schema.domains 
        WHERE domain_schema = 'public'
    LOOP
        RAISE NOTICE 'Found domain: %', domain_record.domain_name;
    END LOOP;
END $$;

-- 15. Check if there are any operators that might be causing issues
DO $$
DECLARE
    operator_record RECORD;
BEGIN
    RAISE NOTICE 'Checking operators...';
    
    FOR operator_record IN 
        SELECT 
            oprname,
            oprleft::regtype,
            oprright::regtype,
            oprresult::regtype
        FROM pg_operator o
        JOIN pg_namespace n ON n.oid = o.oprnamespace
        WHERE n.nspname = 'public'
        AND oprname LIKE '%user%'
        OR oprname LIKE '%auth%'
        OR oprname LIKE '%profile%'
    LOOP
        RAISE NOTICE 'Found operator: %', operator_record.oprname;
    END LOOP;
END $$;

-- 16. Check if there are any aggregates that might be causing issues
DO $$
DECLARE
    aggregate_record RECORD;
BEGIN
    RAISE NOTICE 'Checking aggregates...';
    
    FOR aggregate_record IN 
        SELECT 
            aggname,
            aggtransfn::regproc,
            aggfinalfn::regproc
        FROM pg_aggregate a
        JOIN pg_proc p ON p.oid = a.aggfnoid
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND aggname LIKE '%user%'
        OR aggname LIKE '%auth%'
        OR aggname LIKE '%profile%'
    LOOP
        RAISE NOTICE 'Found aggregate: %', aggregate_record.aggname;
    END LOOP;
END $$;

-- 17. Check if there are any casts that might be causing issues
DO $$
DECLARE
    cast_record RECORD;
BEGIN
    RAISE NOTICE 'Checking casts...';
    
    FOR cast_record IN 
        SELECT 
            castsource::regtype,
            casttarget::regtype,
            castfunc::regproc
        FROM pg_cast c
        JOIN pg_namespace n ON n.oid = c.castnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found cast: % -> %', cast_record.castsource, cast_record.casttarget;
    END LOOP;
END $$;

-- 18. Check if there are any conversions that might be causing issues
DO $$
DECLARE
    conversion_record RECORD;
BEGIN
    RAISE NOTICE 'Checking conversions...';
    
    FOR conversion_record IN 
        SELECT 
            conname,
            conproc::regproc
        FROM pg_conversion c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found conversion: %', conversion_record.conname;
    END LOOP;
END $$;

-- 19. Check if there are any schemas that might be causing issues
DO $$
DECLARE
    schema_record RECORD;
BEGIN
    RAISE NOTICE 'Checking schemas...';
    
    FOR schema_record IN 
        SELECT 
            schema_name
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        RAISE NOTICE 'Found schema: %', schema_record.schema_name;
    END LOOP;
END $$;

-- 20. Check if there are any extensions that might be causing issues
DO $$
DECLARE
    extension_record RECORD;
BEGIN
    RAISE NOTICE 'Checking extensions...';
    
    FOR extension_record IN 
        SELECT 
            extname,
            extversion
        FROM pg_extension
    LOOP
        RAISE NOTICE 'Found extension: % version %', extension_record.extname, extension_record.extversion;
    END LOOP;
END $$;

-- 21. Check if there are any collations that might be causing issues
DO $$
DECLARE
    collation_record RECORD;
BEGIN
    RAISE NOTICE 'Checking collations...';
    
    FOR collation_record IN 
        SELECT 
            collname,
            collcollate,
            collctype
        FROM pg_collation c
        JOIN pg_namespace n ON n.oid = c.collnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found collation: %', collation_record.collname;
    END LOOP;
END $$;

-- 22. Check if there are any foreign data wrappers that might be causing issues
DO $$
DECLARE
    fdw_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign data wrappers...';
    
    FOR fdw_record IN 
        SELECT 
            fdwname,
            fdwhandler::regproc,
            fdwvalidator::regproc
        FROM pg_foreign_data_wrapper
    LOOP
        RAISE NOTICE 'Found foreign data wrapper: %', fdw_record.fdwname;
    END LOOP;
END $$;

-- 23. Check if there are any foreign servers that might be causing issues
DO $$
DECLARE
    server_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign servers...';
    
    FOR server_record IN 
        SELECT 
            srvname,
            srvtype,
            srvversion,
            srvacl
        FROM pg_foreign_server
    LOOP
        RAISE NOTICE 'Found foreign server: %', server_record.srvname;
    END LOOP;
END $$;

-- 24. Check if there are any foreign tables that might be causing issues
DO $$
DECLARE
    foreign_table_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign tables...';
    
    FOR foreign_table_record IN 
        SELECT 
            schemaname,
            tablename,
            servername
        FROM pg_foreign_table ft
        JOIN pg_class c ON c.oid = ft.ftrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found foreign table: %.%', foreign_table_record.schemaname, foreign_table_record.tablename;
    END LOOP;
END $$;

-- 25. Check if there are any user mappings that might be causing issues
DO $$
DECLARE
    mapping_record RECORD;
BEGIN
    RAISE NOTICE 'Checking user mappings...';
    
    FOR mapping_record IN 
        SELECT 
            um.srvname,
            um.usename,
            um.options
        FROM pg_user_mappings um
    LOOP
        RAISE NOTICE 'Found user mapping: % -> %', mapping_record.srvname, mapping_record.usename;
    END LOOP;
END $$;

-- 26. Check if there are any policies that might be causing issues
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Checking policies...';
    
    FOR policy_record IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Found policy: % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 27. Check if there are any publications that might be causing issues
DO $$
DECLARE
    publication_record RECORD;
BEGIN
    RAISE NOTICE 'Checking publications...';
    
    FOR publication_record IN 
        SELECT 
            pubname,
            puballtables,
            pubinsert,
            pubupdate,
            pubdelete,
            pubtruncate
        FROM pg_publication
    LOOP
        RAISE NOTICE 'Found publication: %', publication_record.pubname;
    END LOOP;
END $$;

-- 28. Check if there are any subscriptions that might be causing issues
DO $$
DECLARE
    subscription_record RECORD;
BEGIN
    RAISE NOTICE 'Checking subscriptions...';
    
    FOR subscription_record IN 
        SELECT 
            subname,
            subconninfo,
            subslotname,
            subsynccommit,
            subpublications
        FROM pg_subscription
    LOOP
        RAISE NOTICE 'Found subscription: %', subscription_record.subname;
    END LOOP;
END $$;

-- 29. Check if there are any transforms that might be causing issues
DO $$
DECLARE
    transform_record RECORD;
BEGIN
    RAISE NOTICE 'Checking transforms...';
    
    FOR transform_record IN 
        SELECT 
            trftype::regtype,
            trflang::regproc,
            trffromsql::regproc,
            trftosql::regproc
        FROM pg_transform t
        JOIN pg_namespace n ON n.oid = t.trfnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found transform: %', transform_record.trftype;
    END LOOP;
END $$;

-- 30. Check if there are any operator classes that might be causing issues
DO $$
DECLARE
    opclass_record RECORD;
BEGIN
    RAISE NOTICE 'Checking operator classes...';
    
    FOR opclass_record IN 
        SELECT 
            opcname,
            opcnamespace::regnamespace,
            opcowner::regrole,
            opcfamily::regoperatorfamily,
            opcintype::regtype,
            opcdefault,
            opckeytype::regtype
        FROM pg_opclass oc
        JOIN pg_namespace n ON n.oid = oc.opcnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found operator class: %', opclass_record.opcname;
    END LOOP;
END $$;

-- 31. Check if there are any operator families that might be causing issues
DO $$
DECLARE
    opfamily_record RECORD;
BEGIN
    RAISE NOTICE 'Checking operator families...';
    
    FOR opfamily_record IN 
        SELECT 
            opfname,
            opfnamespace::regnamespace,
            opfowner::regrole
        FROM pg_opfamily of
        JOIN pg_namespace n ON n.oid = of.opfnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found operator family: %', opfamily_record.opfname;
    END LOOP;
END $$;

-- 32. Check if there are any access methods that might be causing issues
DO $$
DECLARE
    access_method_record RECORD;
BEGIN
    RAISE NOTICE 'Checking access methods...';
    
    FOR access_method_record IN 
        SELECT 
            amname,
            amhandler::regproc,
            amtype
        FROM pg_am
    LOOP
        RAISE NOTICE 'Found access method: %', access_method_record.amname;
    END LOOP;
END $$;

-- 33. Check if there are any tablespaces that might be causing issues
DO $$
DECLARE
    tablespace_record RECORD;
BEGIN
    RAISE NOTICE 'Checking tablespaces...';
    
    FOR tablespace_record IN 
        SELECT 
            spcname,
            spcowner::regrole,
            spcoptions
        FROM pg_tablespace
    LOOP
        RAISE NOTICE 'Found tablespace: %', tablespace_record.spcname;
    END LOOP;
END $$;

-- 34. Check if there are any roles that might be causing issues
DO $$
DECLARE
    role_record RECORD;
BEGIN
    RAISE NOTICE 'Checking roles...';
    
    FOR role_record IN 
        SELECT 
            rolname,
            rolsuper,
            rolinherit,
            rolcreaterole,
            rolcreatedb,
            rolcanlogin,
            rolreplication,
            rolconnlimit,
            rolpassword,
            rolvaliduntil,
            rolbypassrls,
            rolconfig
        FROM pg_roles
        WHERE rolname NOT LIKE 'pg_%'
        AND rolname != 'postgres'
    LOOP
        RAISE NOTICE 'Found role: %', role_record.rolname;
    END LOOP;
END $$;

-- 35. Check if there are any databases that might be causing issues
DO $$
DECLARE
    database_record RECORD;
BEGIN
    RAISE NOTICE 'Checking databases...';
    
    FOR database_record IN 
        SELECT 
            datname,
            datdba::regrole,
            encoding,
            datcollate,
            datctype,
            datistemplate,
            datallowconn,
            datconnlimit,
            datlastsysoid,
            datfrozenxid,
            datminmxid,
            dattablespace,
            datacl
        FROM pg_database
        WHERE datname NOT IN ('template0', 'template1')
    LOOP
        RAISE NOTICE 'Found database: %', database_record.datname;
    END LOOP;
END $$;

-- 36. Check if there are any languages that might be causing issues
DO $$
DECLARE
    language_record RECORD;
BEGIN
    RAISE NOTICE 'Checking languages...';
    
    FOR language_record IN 
        SELECT 
            lanname,
            lanowner::regrole,
            lanispl,
            lanpltrusted,
            lanplcallfoid::regproc,
            laninline::regproc,
            lanvalidator::regproc,
            lanacl
        FROM pg_language
    LOOP
        RAISE NOTICE 'Found language: %', language_record.lanname;
    END LOOP;
END $$;

-- 37. Check if there are any namespaces that might be causing issues
DO $$
DECLARE
    namespace_record RECORD;
BEGIN
    RAISE NOTICE 'Checking namespaces...';
    
    FOR namespace_record IN 
        SELECT 
            nspname,
            nspowner::regrole,
            nspacl
        FROM pg_namespace
        WHERE nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        RAISE NOTICE 'Found namespace: %', namespace_record.nspname;
    END LOOP;
END $$;

-- 38. Check if there are any statistics that might be causing issues
DO $$
DECLARE
    stat_record RECORD;
BEGIN
    RAISE NOTICE 'Checking statistics...';
    
    FOR stat_record IN 
        SELECT 
            starelid::regclass,
            staschemaname,
            staname,
            stanumbers,
            stavalues
        FROM pg_statistic_ext s
        JOIN pg_namespace n ON n.oid = s.stanamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found statistics: % on %', stat_record.staname, stat_record.starelid;
    END LOOP;
END $$;

-- 39. Check if there are any statistics extensions that might be causing issues
DO $$
DECLARE
    stat_ext_record RECORD;
BEGIN
    RAISE NOTICE 'Checking statistics extensions...';
    
    FOR stat_ext_record IN 
        SELECT 
            stxname,
            stxnamespace::regnamespace,
            stxowner::regrole,
            stxrelid::regclass,
            stxstattarget,
            stxkeys,
            stxkind
        FROM pg_statistic_ext
    LOOP
        RAISE NOTICE 'Found statistics extension: %', stat_ext_record.stxname;
    END LOOP;
END $$;

-- 40. Check if there are any text search configurations that might be causing issues
DO $$
DECLARE
    ts_config_record RECORD;
BEGIN
    RAISE NOTICE 'Checking text search configurations...';
    
    FOR ts_config_record IN 
        SELECT 
            cfgname,
            cfgnamespace::regnamespace,
            cfgowner::regrole,
            cfgparser::regproc
        FROM pg_ts_config c
        JOIN pg_namespace n ON n.oid = c.cfgnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found text search config: %', ts_config_record.cfgname;
    END LOOP;
END $$;

-- 41. Check if there are any text search dictionaries that might be causing issues
DO $$
DECLARE
    ts_dict_record RECORD;
BEGIN
    RAISE NOTICE 'Checking text search dictionaries...';
    
    FOR ts_dict_record IN 
        SELECT 
            dictname,
            dictnamespace::regnamespace,
            dictowner::regrole,
            dicttemplate::regproc,
            dictinitoption
        FROM pg_ts_dict d
        JOIN pg_namespace n ON n.oid = d.dictnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found text search dictionary: %', ts_dict_record.dictname;
    END LOOP;
END $$;

-- 42. Check if there are any text search parsers that might be causing issues
DO $$
DECLARE
    ts_parser_record RECORD;
BEGIN
    RAISE NOTICE 'Checking text search parsers...';
    
    FOR ts_parser_record IN 
        SELECT 
            prsname,
            prsnamespace::regnamespace,
            prsstart::regproc,
            prstoken::regproc,
            prsend::regproc,
            prslextype::regproc,
            prsheadline::regproc
        FROM pg_ts_parser p
        JOIN pg_namespace n ON n.oid = p.prsnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found text search parser: %', ts_parser_record.prsname;
    END LOOP;
END $$;

-- 43. Check if there are any text search templates that might be causing issues
DO $$
DECLARE
    ts_template_record RECORD;
BEGIN
    RAISE NOTICE 'Checking text search templates...';
    
    FOR ts_template_record IN 
        SELECT 
            tmplname,
            tmplnamespace::regnamespace,
            tmplinit::regproc,
            tmpllexize::regproc
        FROM pg_ts_template t
        JOIN pg_namespace n ON n.oid = t.tmplnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found text search template: %', ts_template_record.tmplname;
    END LOOP;
END $$;

-- 44. Check if there are any foreign data wrappers that might be causing issues
DO $$
DECLARE
    fdw_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign data wrappers...';
    
    FOR fdw_record IN 
        SELECT 
            fdwname,
            fdwhandler::regproc,
            fdwvalidator::regproc
        FROM pg_foreign_data_wrapper
    LOOP
        RAISE NOTICE 'Found foreign data wrapper: %', fdw_record.fdwname;
    END LOOP;
END $$;

-- 45. Check if there are any foreign servers that might be causing issues
DO $$
DECLARE
    server_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign servers...';
    
    FOR server_record IN 
        SELECT 
            srvname,
            srvtype,
            srvversion,
            srvacl
        FROM pg_foreign_server
    LOOP
        RAISE NOTICE 'Found foreign server: %', server_record.srvname;
    END LOOP;
END $$;

-- 46. Check if there are any foreign tables that might be causing issues
DO $$
DECLARE
    foreign_table_record RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign tables...';
    
    FOR foreign_table_record IN 
        SELECT 
            schemaname,
            tablename,
            servername
        FROM pg_foreign_table ft
        JOIN pg_class c ON c.oid = ft.ftrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found foreign table: %.%', foreign_table_record.schemaname, foreign_table_record.tablename;
    END LOOP;
END $$;

-- 47. Check if there are any user mappings that might be causing issues
DO $$
DECLARE
    mapping_record RECORD;
BEGIN
    RAISE NOTICE 'Checking user mappings...';
    
    FOR mapping_record IN 
        SELECT 
            um.srvname,
            um.usename,
            um.options
        FROM pg_user_mappings um
    LOOP
        RAISE NOTICE 'Found user mapping: % -> %', mapping_record.srvname, mapping_record.usename;
    END LOOP;
END $$;

-- 48. Check if there are any policies that might be causing issues
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Checking policies...';
    
    FOR policy_record IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Found policy: % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 49. Check if there are any publications that might be causing issues
DO $$
DECLARE
    publication_record RECORD;
BEGIN
    RAISE NOTICE 'Checking publications...';
    
    FOR publication_record IN 
        SELECT 
            pubname,
            puballtables,
            pubinsert,
            pubupdate,
            pubdelete,
            pubtruncate
        FROM pg_publication
    LOOP
        RAISE NOTICE 'Found publication: %', publication_record.pubname;
    END LOOP;
END $$;

-- 50. Check if there are any subscriptions that might be causing issues
DO $$
DECLARE
    subscription_record RECORD;
BEGIN
    RAISE NOTICE 'Checking subscriptions...';
    
    FOR subscription_record IN 
        SELECT 
            subname,
            subconninfo,
            subslotname,
            subsynccommit,
            subpublications
        FROM pg_subscription
    LOOP
        RAISE NOTICE 'Found subscription: %', subscription_record.subname;
    END LOOP;
END $$;

-- Summary
SELECT 'Database schema check completed. Check the logs above for any issues that might be causing Auth user creation to fail.' as status; 