--
-- PostgreSQL database dump
--

\restrict 6hCHfwiiD5qUb96ltk59r1kdYCgGVXCHHgebBHPIGARAMkPgdPPTdKrt8glBWjk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-07 09:16:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 235 (class 1259 OID 16662)
-- Name: current_playbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.current_playbacks (
    id integer NOT NULL,
    extension_number text[] NOT NULL,
    task_type character varying(20) NOT NULL,
    task_id integer,
    start_at timestamp without time zone DEFAULT now() NOT NULL,
    end_at timestamp without time zone,
    status character varying(10) DEFAULT 'playing'::character varying NOT NULL,
    group_id integer,
    current_song_index integer DEFAULT 0,
    elapsed_time integer DEFAULT 0,
    is_paused boolean DEFAULT false,
    volume integer
);


ALTER TABLE public.current_playbacks OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16661)
-- Name: current_playbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.current_playbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.current_playbacks_id_seq OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 234
-- Name: current_playbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.current_playbacks_id_seq OWNED BY public.current_playbacks.id;


--
-- TOC entry 228 (class 1259 OID 16563)
-- Name: music_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.music_library (
    id integer NOT NULL,
    zycoo_music_name character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    path character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    zycoo_music_id integer
);


ALTER TABLE public.music_library OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16562)
-- Name: music_library_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.music_library_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.music_library_id_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 227
-- Name: music_library_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.music_library_id_seq OWNED BY public.music_library.id;


--
-- TOC entry 237 (class 1259 OID 16686)
-- Name: playback_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playback_logs (
    id integer NOT NULL,
    date date NOT NULL,
    start_at timestamp without time zone,
    end_at timestamp without time zone,
    task_type character varying,
    task_id integer,
    task_name character varying,
    extension_number character varying[],
    user_id integer,
    group_name character varying
);


ALTER TABLE public.playback_logs OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16685)
-- Name: playback_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playback_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playback_logs_id_seq OWNER TO postgres;

--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 236
-- Name: playback_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playback_logs_id_seq OWNED BY public.playback_logs.id;


--
-- TOC entry 230 (class 1259 OID 16580)
-- Name: playlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlist (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    remark text,
    source_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.playlist OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16579)
-- Name: playlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlist_id_seq OWNER TO postgres;

--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 229
-- Name: playlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playlist_id_seq OWNED BY public.playlist.id;


--
-- TOC entry 232 (class 1259 OID 16591)
-- Name: playlist_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlist_item (
    id integer NOT NULL,
    playlist_id integer NOT NULL,
    music_library_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.playlist_item OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16590)
-- Name: playlist_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playlist_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlist_item_id_seq OWNER TO postgres;

--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 231
-- Name: playlist_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playlist_item_id_seq OWNED BY public.playlist_item.id;


--
-- TOC entry 226 (class 1259 OID 16492)
-- Name: speaker_group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.speaker_group_members (
    id integer NOT NULL,
    group_id integer,
    speaker_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.speaker_group_members OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16491)
-- Name: speaker_group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.speaker_group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.speaker_group_members_id_seq OWNER TO postgres;

--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 225
-- Name: speaker_group_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.speaker_group_members_id_seq OWNED BY public.speaker_group_members.id;


--
-- TOC entry 224 (class 1259 OID 16482)
-- Name: speaker_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.speaker_groups (
    id integer NOT NULL,
    group_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.speaker_groups OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16481)
-- Name: speaker_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.speaker_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.speaker_groups_id_seq OWNER TO postgres;

--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 223
-- Name: speaker_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.speaker_groups_id_seq OWNED BY public.speaker_groups.id;


--
-- TOC entry 222 (class 1259 OID 16465)
-- Name: speakers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.speakers (
    id integer NOT NULL,
    speaker_name character varying(100) NOT NULL,
    speaker_code character varying(50) NOT NULL,
    extension_number character varying(20) NOT NULL,
    zone_id integer,
    floor_level character varying(20),
    is_online boolean DEFAULT false,
    last_status_update timestamp without time zone
);


ALTER TABLE public.speakers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16464)
-- Name: speakers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.speakers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.speakers_id_seq OWNER TO postgres;

--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 221
-- Name: speakers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.speakers_id_seq OWNED BY public.speakers.id;


--
-- TOC entry 233 (class 1259 OID 16652)
-- Name: task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    source_id character varying(100) NOT NULL,
    volume integer DEFAULT 30,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    task_type character varying(20),
    start_time time without time zone,
    end_time time without time zone,
    week_days text[],
    extensions text[],
    start_date date,
    end_date date,
    user_id integer
);


ALTER TABLE public.task OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16405)
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_tokens (
    id integer NOT NULL,
    userid integer NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_tokens OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16404)
-- Name: user_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_tokens_id_seq OWNED BY public.user_tokens.id;


--
-- TOC entry 220 (class 1259 OID 16418)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    token character varying(500),
    id_zycootoken integer DEFAULT 1,
    failed_attempts integer DEFAULT 0,
    last_failed timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16417)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4765 (class 2604 OID 16665)
-- Name: current_playbacks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_playbacks ALTER COLUMN id SET DEFAULT nextval('public.current_playbacks_id_seq'::regclass);


--
-- TOC entry 4755 (class 2604 OID 16566)
-- Name: music_library id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.music_library ALTER COLUMN id SET DEFAULT nextval('public.music_library_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 16689)
-- Name: playback_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs ALTER COLUMN id SET DEFAULT nextval('public.playback_logs_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 16583)
-- Name: playlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist ALTER COLUMN id SET DEFAULT nextval('public.playlist_id_seq'::regclass);


--
-- TOC entry 4760 (class 2604 OID 16594)
-- Name: playlist_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_item ALTER COLUMN id SET DEFAULT nextval('public.playlist_item_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 16495)
-- Name: speaker_group_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_group_members ALTER COLUMN id SET DEFAULT nextval('public.speaker_group_members_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 16485)
-- Name: speaker_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_groups ALTER COLUMN id SET DEFAULT nextval('public.speaker_groups_id_seq'::regclass);


--
-- TOC entry 4748 (class 2604 OID 16468)
-- Name: speakers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speakers ALTER COLUMN id SET DEFAULT nextval('public.speakers_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 16408)
-- Name: user_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens ALTER COLUMN id SET DEFAULT nextval('public.user_tokens_id_seq'::regclass);


--
-- TOC entry 4975 (class 0 OID 16662)
-- Dependencies: 235
-- Data for Name: current_playbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.current_playbacks (id, extension_number, task_type, task_id, start_at, end_at, status, group_id, current_song_index, elapsed_time, is_paused, volume) FROM stdin;
210	{8112}	announce	\N	2025-10-02 08:55:06.565	2025-10-02 08:55:15.306	stopped	\N	0	0	f	\N
151	{8112,8113}	announce	\N	2025-09-30 14:51:02.87	2025-09-30 14:51:15.597	stopped	\N	0	0	f	\N
169	{8409,8408,1002}	schedule	175	2025-10-01 15:07:00	2025-10-01 15:08:50.535	stopped	\N	0	0	f	3
174	{8409,8408,1002}	schedule	177	2025-10-01 15:17:00	2025-10-01 15:17:04.422	stopped	\N	0	0	f	3
193	{1002,8408,8409}	playlist	385	2025-10-06 16:00:53.303	2025-10-06 16:04:58.126	stopped	\N	0	27	f	1
192	{1002,8408,8409}	playlist	386	2025-10-06 16:04:58.126	\N	playing	\N	1	30	t	1
\.


--
-- TOC entry 4968 (class 0 OID 16563)
-- Dependencies: 228
-- Data for Name: music_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.music_library (id, zycoo_music_name, name, path, created_at, zycoo_music_id) FROM stdin;
58	รักเธอหัวทิ่มบ่อ-Tal7253.mp3	รักเธอหัวทิ่มบ่อ.mp3	uploads\\รักเธอหัวทิ่มบ่อ-Tal7253.mp3	2025-09-11 15:07:07.404979	338
60	เพลงรัก-Tal8375.mp3	เพลงรัก.mp3	uploads\\เพลงรัก-Tal8375.mp3	2025-09-11 15:10:04.96999	340
62	Girl on Fire-Tal6179.mp3	Girl on Fire.mp3	uploads\\Girl on Fire-Tal6179.mp3	2025-09-22 17:02:47.591626	342
63	My Name Is Brian-Tal8428.mp3	My Name Is Brian.mp3	uploads\\My Name Is Brian-Tal8428.mp3	2025-09-22 17:02:48.029205	343
13	Tommy Richman – DEVIL IS A LIE-Tal1002.mp3	Tommy Richman – DEVIL IS A LIE.mp3	uploads\\Tommy Richman – DEVIL IS A LIE-Tal1002.mp3	2025-09-04 15:29:43.839226	293
53	drums-Tal7458.mp3	drums.mp3	uploads\\drums-Tal7458.mp3	2025-09-10 14:58:00.916917	333
\.


--
-- TOC entry 4977 (class 0 OID 16686)
-- Dependencies: 237
-- Data for Name: playback_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playback_logs (id, date, start_at, end_at, task_type, task_id, task_name, extension_number, user_id, group_name) FROM stdin;
1	2025-09-24	2025-09-24 15:07:00	2025-09-24 15:09:00	schedule	175	test schedule 2	{8409,8408,1002}	1	\N
2	2025-09-24	2025-09-24 15:12:00	2025-09-24 15:14:00	calendar	176	test calendar 2	{8409,8408,1002}	1	\N
103	2025-10-06	2025-10-06 13:51:29.451	2025-10-06 13:53:06.659	playlist	386	test move /2	{1002,8408,8409}	2	\N
104	2025-10-06	2025-10-06 13:53:06.659	2025-10-06 13:59:55.449	playlist	385	test move	{8409,1002,8408}	2	\N
105	2025-10-06	2025-10-06 13:59:55.449	2025-10-06 14:02:27.176	playlist	386	test move /2	{8409,1002,8408}	2	\N
106	2025-10-06	2025-10-06 14:02:27.176	2025-10-06 14:17:34.421	playlist	385	test move	{1002,8408,8409}	2	\N
107	2025-10-06	2025-10-06 14:17:34.421	2025-10-06 14:24:36.25	playlist	386	test move /2	{8409,1002,8408}	2	\N
108	2025-10-06	2025-10-06 14:24:36.25	2025-10-06 14:29:23.98	playlist	385	test move	{8409,1002,8408}	2	\N
109	2025-10-06	2025-10-06 14:29:23.98	2025-10-06 15:07:15.926	playlist	386	test move /2	{8409,1002,8408}	2	\N
110	2025-10-06	2025-10-06 15:07:15.926	2025-10-06 15:07:56.565	playlist	385	test move	{8409,1002,8408}	2	\N
111	2025-10-06	2025-10-06 15:07:56.565	2025-10-06 15:09:25.594	playlist	386	test move /2	{8409,1002,8408}	2	\N
112	2025-10-06	2025-10-06 15:09:25.594	2025-10-06 15:10:09.739	playlist	385	test move	{1002,8408,8409}	2	\N
113	2025-10-06	2025-10-06 15:10:09.739	2025-10-06 15:13:43.51	playlist	386	test move /2	{1002,8408,8409}	2	\N
114	2025-10-06	2025-10-06 15:13:43.51	2025-10-06 15:16:44.276	playlist	385	test move	{8409,1002,8408}	2	\N
115	2025-10-06	2025-10-06 15:16:44.276	2025-10-06 15:17:52.781	playlist	386	test move /2	{8409,1002,8408}	2	\N
116	2025-10-06	2025-10-06 15:17:52.781	2025-10-06 15:18:14.86	playlist	385	test move	{8409,1002,8408}	2	\N
117	2025-10-06	2025-10-06 15:18:14.86	2025-10-06 15:19:10.527	playlist	386	test move /2	{8409,1002,8408}	2	\N
118	2025-10-06	2025-10-06 15:19:10.527	2025-10-06 15:23:00.475	playlist	385	test move	{8409,1002,8408}	2	\N
119	2025-10-06	2025-10-06 15:23:00.475	2025-10-06 15:31:49.67	playlist	386	test move /2	{8409,1002,8408}	2	\N
120	2025-10-06	2025-10-06 15:31:49.67	2025-10-06 15:32:22.933	playlist	385	test move	{8409,1002,8408}	2	\N
121	2025-10-06	2025-10-06 15:32:22.933	2025-10-06 15:33:20.647	playlist	386	test move /2	{8409,1002,8408}	2	\N
122	2025-10-06	2025-10-06 15:35:10.727	2025-10-06 15:35:57.482	playlist	386	test move /2	{1002,8408,8409}	2	\N
123	2025-10-06	2025-10-06 15:35:57.482	2025-10-06 15:55:31.397	playlist	385	test move	{8409,1002,8408}	2	\N
124	2025-10-06	2025-10-06 15:55:31.397	2025-10-06 15:58:15.765	playlist	386	test move /2	{8409,1002,8408}	2	\N
125	2025-10-06	2025-10-06 15:58:15.765	2025-10-06 15:59:57.181	playlist	385	test move	{8409,1002,8408}	2	\N
126	2025-10-06	2025-10-06 15:59:57.181	2025-10-06 16:00:53.303	playlist	386	test move /2	{1002,8408,8409}	2	\N
127	2025-10-06	2025-10-06 16:00:53.303	2025-10-06 16:04:58.126	playlist	385	test move	{1002,8408,8409}	2	\N
\.


--
-- TOC entry 4970 (class 0 OID 16580)
-- Dependencies: 230
-- Data for Name: playlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playlist (id, name, remark, source_id, created_at, updated_at) FROM stdin;
61	test move		385	2025-09-22 17:03:11.677247	2025-09-22 17:03:11.677247
62	test move /2	my name is biran	386	2025-09-23 09:00:49.122925	2025-10-01 17:28:38.653867
\.


--
-- TOC entry 4972 (class 0 OID 16591)
-- Dependencies: 232
-- Data for Name: playlist_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playlist_item (id, playlist_id, music_library_id, created_at, "position") FROM stdin;
292	62	13	2025-10-01 17:28:38.662272	0
293	62	60	2025-10-01 17:28:38.675728	1
294	62	58	2025-10-01 17:28:38.676959	2
271	61	63	2025-09-22 17:03:11.686524	0
272	61	62	2025-09-22 17:03:11.691181	1
273	61	60	2025-09-22 17:03:11.692665	2
\.


--
-- TOC entry 4966 (class 0 OID 16492)
-- Dependencies: 226
-- Data for Name: speaker_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.speaker_group_members (id, group_id, speaker_id, created_at) FROM stdin;
121	1	17	2025-09-24 10:58:43.985054
122	4	17	2025-09-24 14:28:31.475937
3	2	1	2025-09-02 09:17:04.407
4	3	2	2025-09-02 09:17:10.772813
5	4	1	2025-09-02 11:02:41.628306
6	4	2	2025-09-02 11:02:41.628306
7	4	3	2025-09-02 11:02:41.628306
8	4	4	2025-09-02 11:02:41.628306
66	1	3	2025-09-03 11:33:58.637011
67	1	4	2025-09-03 11:33:58.637011
105	71	3	2025-09-03 13:58:34.705803
106	71	4	2025-09-03 13:58:34.705803
114	70	1	2025-09-11 10:33:51.337619
\.


--
-- TOC entry 4964 (class 0 OID 16482)
-- Dependencies: 224
-- Data for Name: speaker_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.speaker_groups (id, group_name, created_at, is_active) FROM stdin;
2	Pole1	2025-09-02 09:17:04.404097	t
3	Pole2	2025-09-02 09:17:10.771508	t
4	ลำโพงทั้งหมด	2025-09-02 11:02:41.618609	t
1	Building	2025-09-03 11:33:58.633517	t
71	group2	2025-09-03 13:58:34.702496	t
70	group1	2025-09-03 13:41:57.216941	t
\.


--
-- TOC entry 4962 (class 0 OID 16465)
-- Dependencies: 222
-- Data for Name: speakers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.speakers (id, speaker_name, speaker_code, extension_number, zone_id, floor_level, is_online, last_status_update) FROM stdin;
4	ลำโพงชั้นที่ 2	SPK-004	1002	1	ชั้น 2	t	2025-10-07 09:16:02.068734
3	ลำโพงชั้นที่ 1	SPK-003	8408	1	ชั้น 1	f	2025-10-07 09:16:02.077736
17	ลำโพงชั้นที่ 3	SPK-005	8409	1	ชั้น 3	f	\N
1	ลำโพงเสาต้นที่ 1	SPK-001	8112	2	\N	f	\N
2	ลำโพงเสาต้นที่ 2	SPK-002	8113	3	\N	f	\N
\.


--
-- TOC entry 4973 (class 0 OID 16652)
-- Dependencies: 233
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task (id, name, source_id, volume, created_at, task_type, start_time, end_time, week_days, extensions, start_date, end_date, user_id) FROM stdin;
173	test schedule	sourceId-386	\N	2025-09-23 09:33:07.080602	schedule	09:35:00	09:37:00	{tues}	{8408,1002}	\N	\N	1
174	test cakendar	sourceId-385	\N	2025-09-23 09:33:31.099207	calendar	09:40:00	09:42:00	{tues}	{8408,1002}	2025-09-23	2025-09-23	1
176	test calendar 2	sourceId-386	\N	2025-09-24 15:05:09.571382	calendar	15:12:00	15:14:00	{wed}	{8409,8408,1002}	2025-09-24	2025-09-24	1
177	test schdule 2	sourceId-386	\N	2025-10-01 15:15:08.78629	schedule	15:17:00	15:19:00	{wed}	{8409,8408,1002}	\N	\N	1
\.


--
-- TOC entry 4958 (class 0 OID 16405)
-- Dependencies: 218
-- Data for Name: user_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_tokens (id, userid, token, created_at) FROM stdin;
63	16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRhbDEwMSIsInVzZXJJZCI6MTYsImV4cCI6MTc2MjM5NDA5NywiaWF0IjoxNzU5ODAyMDk3fQ.oIKQ6p8NLr-uDwdnqzQd1j5bTKO-ARChNGsyYfgPiKU	2025-10-07 08:54:02
1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRhbDEwMSIsInVzZXJJZCI6MTYsImV4cCI6MTc2MjMwNzgwNiwiaWF0IjoxNzU5NzE1ODA2fQ.ASaT4vPc5UqQoe7d8XCiyFMo7JDuXMeFdOlAaEAuJIk	2025-09-04 09:43:31
\.


--
-- TOC entry 4960 (class 0 OID 16418)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, token, id_zycootoken, failed_attempts, last_failed) FROM stdin;
1	Saran	$2b$10$h0DnYcu3UwJL9NN1T18ET.7iR7eB1IMmc0N.8A0v/BqdLTi2qXn/G	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJTYXJhbiIsImlhdCI6MTc1OTczMzQ3MSwiZXhwIjoxNzU5ODE5ODcxfQ.4mXk-Pdll-2-QIk65-hiPtfkhB2upY3Ptwd68cA0zCw	1	0	2025-09-24 15:57:34.111202
2	Tal	$2b$10$2WZbMNmHFm2ZCQjzfRcN6uzhxOGynq/2SphOMi3yJbil2YAu24i7S	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJUYWwiLCJpYXQiOjE3NTk3MzM0ODEsImV4cCI6MTc1OTgxOTg4MX0.6i8xcx1PFVxw_dc3gvj1XrH_KNTdkCYOu7lqcXd-fNw	1	0	\N
\.


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 234
-- Name: current_playbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.current_playbacks_id_seq', 247, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 227
-- Name: music_library_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.music_library_id_seq', 63, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 236
-- Name: playback_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playback_logs_id_seq', 127, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 229
-- Name: playlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playlist_id_seq', 62, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 231
-- Name: playlist_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playlist_item_id_seq', 294, true);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 225
-- Name: speaker_group_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.speaker_group_members_id_seq', 122, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 223
-- Name: speaker_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.speaker_groups_id_seq', 76, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 221
-- Name: speakers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.speakers_id_seq', 17, true);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_tokens_id_seq', 65, true);


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4803 (class 2606 OID 16669)
-- Name: current_playbacks current_playbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_playbacks
    ADD CONSTRAINT current_playbacks_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 16571)
-- Name: music_library music_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.music_library
    ADD CONSTRAINT music_library_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 16693)
-- Name: playback_logs playback_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 16597)
-- Name: playlist_item playlist_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_item
    ADD CONSTRAINT playlist_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 16589)
-- Name: playlist playlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist
    ADD CONSTRAINT playlist_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 16660)
-- Name: task schedule_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT schedule_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 16500)
-- Name: speaker_group_members speaker_group_members_group_id_speaker_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_group_members
    ADD CONSTRAINT speaker_group_members_group_id_speaker_id_key UNIQUE (group_id, speaker_id);


--
-- TOC entry 4793 (class 2606 OID 16498)
-- Name: speaker_group_members speaker_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_group_members
    ADD CONSTRAINT speaker_group_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 16490)
-- Name: speaker_groups speaker_groups_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_groups
    ADD CONSTRAINT speaker_groups_group_name_key UNIQUE (group_name);


--
-- TOC entry 4787 (class 2606 OID 16488)
-- Name: speaker_groups speaker_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_groups
    ADD CONSTRAINT speaker_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 16471)
-- Name: speakers speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 16473)
-- Name: speakers speakers_speaker_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_speaker_code_key UNIQUE (speaker_code);


--
-- TOC entry 4805 (class 2606 OID 16695)
-- Name: current_playbacks unique_task_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_playbacks
    ADD CONSTRAINT unique_task_id UNIQUE (task_id);


--
-- TOC entry 4773 (class 2606 OID 16416)
-- Name: user_tokens unique_userid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT unique_userid UNIQUE (userid);


--
-- TOC entry 4775 (class 2606 OID 16413)
-- Name: user_tokens user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 16424)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 16426)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4788 (class 1259 OID 16511)
-- Name: idx_speaker_group_members_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_speaker_group_members_group_id ON public.speaker_group_members USING btree (group_id);


--
-- TOC entry 4789 (class 1259 OID 16512)
-- Name: idx_speaker_group_members_speaker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_speaker_group_members_speaker_id ON public.speaker_group_members USING btree (speaker_id);


--
-- TOC entry 4808 (class 2606 OID 16427)
-- Name: users fk_user_token; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_token FOREIGN KEY (id_zycootoken) REFERENCES public.user_tokens(id) ON DELETE SET NULL;


--
-- TOC entry 4811 (class 2606 OID 16642)
-- Name: playlist_item playlist_item_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_item
    ADD CONSTRAINT playlist_item_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlist(id) ON DELETE CASCADE;


--
-- TOC entry 4809 (class 2606 OID 16501)
-- Name: speaker_group_members speaker_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_group_members
    ADD CONSTRAINT speaker_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.speaker_groups(id) ON DELETE CASCADE;


--
-- TOC entry 4810 (class 2606 OID 16506)
-- Name: speaker_group_members speaker_group_members_speaker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_group_members
    ADD CONSTRAINT speaker_group_members_speaker_id_fkey FOREIGN KEY (speaker_id) REFERENCES public.speakers(id) ON DELETE CASCADE;


-- Completed on 2025-10-07 09:16:43

--
-- PostgreSQL database dump complete
--

\unrestrict 6hCHfwiiD5qUb96ltk59r1kdYCgGVXCHHgebBHPIGARAMkPgdPPTdKrt8glBWjk

