SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AlertStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AlertStatus" AS ENUM (
    'ACTIVE',
    'RESOLVED'
);


ALTER TYPE public."AlertStatus" OWNER TO postgres;

--
-- Name: AlertType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AlertType" AS ENUM (
    'OVERALL_RTO',
    'PINCODE_RTO',
    'CHARGEBACK_RATE',
    'MANUAL_REVIEW_QUEUE'
);


ALTER TYPE public."AlertType" OWNER TO postgres;

--
-- Name: InventoryLogType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InventoryLogType" AS ENUM (
    'PURCHASE',
    'SALE',
    'RETURN',
    'ADJUSTMENT',
    'DAMAGE',
    'RESTOCK'
);


ALTER TYPE public."InventoryLogType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'RAZORPAY',
    'COD'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CALLED'
);


ALTER TYPE public."ReviewStatus" OWNER TO postgres;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'NORMAL',
    'HIGH'
);


ALTER TYPE public."RiskLevel" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'MANAGER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'India'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: Alert; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Alert" (
    id text NOT NULL,
    type public."AlertType" NOT NULL,
    pincode character varying(10),
    "metricValue" numeric(10,2) NOT NULL,
    "thresholdValue" numeric(10,2) NOT NULL,
    status public."AlertStatus" NOT NULL,
    "firstTriggeredAt" timestamp(3) without time zone NOT NULL,
    "lastNotifiedAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Alert" OWNER TO postgres;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: InventoryLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryLog" (
    id text NOT NULL,
    "productId" text NOT NULL,
    type public."InventoryLogType" NOT NULL,
    quantity integer NOT NULL,
    "previousStock" integer NOT NULL,
    "newStock" integer NOT NULL,
    reason text,
    reference text,
    "performedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryLog" OWNER TO postgres;

--
-- Name: ManagerPermissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ManagerPermissions" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "canViewProducts" boolean DEFAULT true NOT NULL,
    "canCreateProducts" boolean DEFAULT false NOT NULL,
    "canEditProducts" boolean DEFAULT false NOT NULL,
    "canDeleteProducts" boolean DEFAULT false NOT NULL,
    "canViewOrders" boolean DEFAULT true NOT NULL,
    "canUpdateOrderStatus" boolean DEFAULT false NOT NULL,
    "canCancelOrders" boolean DEFAULT false NOT NULL,
    "canProcessRefunds" boolean DEFAULT false NOT NULL,
    "canManageInventory" boolean DEFAULT false NOT NULL,
    "canViewAnalytics" boolean DEFAULT false NOT NULL,
    "canExportData" boolean DEFAULT false NOT NULL,
    "canViewCustomers" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ManagerPermissions" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "orderStatus" public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "shippingAddressId" text NOT NULL,
    "billingAddressId" text NOT NULL,
    "trackingNumber" text,
    "customerNotes" text,
    "internalNotes" text,
    "idempotencyKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "gatewayOrderId" text,
    "gatewayPaymentId" text,
    "paymentMethod" public."PaymentMethod",
    "stockDeducted" boolean DEFAULT false NOT NULL,
    "stockDeductedAt" timestamp(3) without time zone,
    chargeback boolean DEFAULT false NOT NULL,
    chargeback_amount numeric(10,2),
    chargeback_date timestamp(3) without time zone,
    is_customer_return boolean DEFAULT false NOT NULL,
    is_manual_review boolean DEFAULT false NOT NULL,
    is_rto boolean DEFAULT false NOT NULL,
    payment_attempts integer DEFAULT 0 NOT NULL,
    review_status public."ReviewStatus",
    rule_score integer DEFAULT 0 NOT NULL,
    "shippingPincode" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    "productImage" text,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderSequence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderSequence" (
    id text NOT NULL,
    date text NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderSequence" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    gateway text NOT NULL,
    "gatewayOrderId" text,
    "gatewayPaymentId" text,
    "gatewaySignature" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    method text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "compareAtPrice" numeric(10,2),
    sku text,
    stock integer DEFAULT 0 NOT NULL,
    "lowStockAlert" integer DEFAULT 10 NOT NULL,
    "categoryId" text,
    images text[],
    thumbnail text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    url text NOT NULL,
    "publicId" text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    phone text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: metrics_snapshot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metrics_snapshot (
    id text NOT NULL,
    date date NOT NULL,
    "mtdGMV" numeric(10,2) NOT NULL,
    "ordersCount" integer NOT NULL,
    "prepaidCount" integer NOT NULL,
    "prepaidPercentage" numeric(5,2) NOT NULL,
    "rtoRate" numeric(5,2) NOT NULL,
    "chargebackRate" numeric(5,2) NOT NULL,
    "avgShippingCost" numeric(10,2) NOT NULL,
    "manualReviewPending" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.metrics_snapshot OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    key text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: pincode_risk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pincode_risk (
    pincode text NOT NULL,
    "totalOrders30d" integer DEFAULT 0 NOT NULL,
    "rtoCount30d" integer DEFAULT 0 NOT NULL,
    "rtoPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "riskLevel" public."RiskLevel" DEFAULT 'NORMAL'::public."RiskLevel" NOT NULL,
    "lastUpdated" timestamp(3) without time zone NOT NULL,
    "lastEvaluatedAt" timestamp(3) without time zone
);


ALTER TABLE public.pincode_risk OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id text NOT NULL,
    "maxLoginAttempts" integer NOT NULL,
    "fraudRiskThreshold" integer NOT NULL,
    "enableEmailVerification" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", "fullName", phone, "addressLine1", "addressLine2", city, state, "postalCode", country, "isDefault", "createdAt", "updatedAt") FROM stdin;
cmmf5uiiu0035q3o9z5tyscws	cmmf5twgb000rq3o9s0mo6j9b	Customer 1	+1-555-0101	100 Main St	\N	New York	NY	10000	USA	t	2026-03-06 17:20:35.911	2026-03-06 17:20:35.911
cmmf5uisu0037q3o92ojs0946	cmmf5txac000sq3o9hbfmz1sb	Customer 2	+1-555-0102	101 Main St	\N	New York	NY	10001	USA	t	2026-03-06 17:20:36.27	2026-03-06 17:20:36.27
cmmf5uixu0039q3o9kpgn04bn	cmmf5ty48000tq3o9waorxsof	Customer 3	+1-555-0103	102 Main St	\N	New York	NY	10002	USA	t	2026-03-06 17:20:36.45	2026-03-06 17:20:36.45
cmmf5uj2y003bq3o9m9e1zh54	cmmf5tyy3000uq3o91smcysv8	Customer 4	+1-555-0104	103 Main St	\N	New York	NY	10003	USA	t	2026-03-06 17:20:36.634	2026-03-06 17:20:36.634
cmmf5uj7y003dq3o9ie6yyjwp	cmmf5tzs2000vq3o9hn3rs3nx	Customer 5	+1-555-0105	104 Main St	\N	New York	NY	10004	USA	t	2026-03-06 17:20:36.814	2026-03-06 17:20:36.814
cmmf5ujcz003fq3o9xdqhnqjd	cmmf5u0m1000wq3o96iifh2ce	Customer 6	+1-555-0106	105 Main St	\N	New York	NY	10005	USA	t	2026-03-06 17:20:36.996	2026-03-06 17:20:36.996
cmmf5uji0003hq3o9in7pci5t	cmmf5u1fx000xq3o9j8zt36bq	Customer 7	+1-555-0107	106 Main St	\N	New York	NY	10006	USA	t	2026-03-06 17:20:37.176	2026-03-06 17:20:37.176
cmmf5ujn0003jq3o9sqadht4b	cmmf5u29v000yq3o9z2n9rjgt	Customer 8	+1-555-0108	107 Main St	\N	New York	NY	10007	USA	t	2026-03-06 17:20:37.357	2026-03-06 17:20:37.357
cmmf5ujs1003lq3o95jlmk9fz	cmmf5u33t000zq3o96nn7do64	Customer 9	+1-555-0109	108 Main St	\N	New York	NY	10008	USA	t	2026-03-06 17:20:37.537	2026-03-06 17:20:37.537
cmmf5ujx1003nq3o92452hqj7	cmmf5u3xp0010q3o93s59an8h	Customer 10	+1-555-0110	109 Main St	\N	New York	NY	10009	USA	t	2026-03-06 17:20:37.717	2026-03-06 17:20:37.717
cmmf5uk22003pq3o964csnr09	cmmf5u4rm0011q3o97qrg91db	Customer 11	+1-555-0111	110 Main St	\N	New York	NY	10010	USA	t	2026-03-06 17:20:37.898	2026-03-06 17:20:37.898
cmmf5uk71003rq3o9mpefig6w	cmmf5u5qh0012q3o9hhzfcadp	Customer 12	+1-555-0112	111 Main St	\N	New York	NY	10011	USA	t	2026-03-06 17:20:38.078	2026-03-06 17:20:38.078
cmmf5ukc2003tq3o9ouchx2fh	cmmf5u6kp0013q3o9gm792n14	Customer 13	+1-555-0113	112 Main St	\N	New York	NY	10012	USA	t	2026-03-06 17:20:38.258	2026-03-06 17:20:38.258
cmmf5ukh5003vq3o9n25sux8t	cmmf5u7em0014q3o9touz3mf3	Customer 14	+1-555-0114	113 Main St	\N	New York	NY	10013	USA	t	2026-03-06 17:20:38.441	2026-03-06 17:20:38.441
cmmf5ukm5003xq3o9a6uzjrrn	cmmf5u88j0015q3o9ko5j8fd8	Customer 15	+1-555-0115	114 Main St	\N	New York	NY	10014	USA	t	2026-03-06 17:20:38.622	2026-03-06 17:20:38.622
cmmf74ck4000dxfswotea5kc7	cmmf71xgp0001xfswrrah6w4v	Bhomik Pilkhwal	+919871169164	b-1156	\N	delhi	Delhi	110096	India	t	2026-03-06 17:56:14.356	2026-03-06 17:56:14.356
cmmfb9kkw000a1u7i6hx0uqlo	cmmfb8gxi00021u7i217bl1xk	bhomik pilkhwal	+919871169164	Gd Colony Mayur Vihar Phase 3	\N	Delhi	Delhi	110096	India	t	2026-03-06 19:52:16.496	2026-03-06 19:52:16.496
cmmg5ahnr0008vht2nw1kfgzt	cmmg3gni200028ekxddxl6g2g	Bhomik Pilkhwal	+919871169164	b-1156	\N	delhi	Delhi	110096	India	t	2026-03-07 09:52:47.847	2026-03-07 09:52:47.847
\.


--
-- Data for Name: Alert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Alert" (id, type, pincode, "metricValue", "thresholdValue", status, "firstTriggeredAt", "lastNotifiedAt", "resolvedAt", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
cmmf5ukr6003zq3o910kcqyq3	cmmf5twgb000rq3o9s0mo6j9b	2026-03-06 17:20:38.802	2026-03-06 17:20:38.802
cmmf5ulb50043q3o9o4c6aw2m	cmmf5txac000sq3o9hbfmz1sb	2026-03-06 17:20:39.522	2026-03-06 17:20:39.522
cmmf5ull60047q3o9mrbpewli	cmmf5ty48000tq3o9waorxsof	2026-03-06 17:20:39.882	2026-03-06 17:20:39.882
cmmf5ulva004bq3o93mn15owp	cmmf5tyy3000uq3o91smcysv8	2026-03-06 17:20:40.246	2026-03-06 17:20:40.246
cmmf5um5b004fq3o95pxb2ck4	cmmf5tzs2000vq3o9hn3rs3nx	2026-03-06 17:20:40.607	2026-03-06 17:20:40.607
cmmf5umfd004jq3o93556j3j2	cmmf5u0m1000wq3o96iifh2ce	2026-03-06 17:20:40.969	2026-03-06 17:20:40.969
cmmf5umpg004nq3o91ic21u41	cmmf5u1fx000xq3o9j8zt36bq	2026-03-06 17:20:41.332	2026-03-06 17:20:41.332
cmmf5umzj004rq3o978xcalgo	cmmf5u29v000yq3o9z2n9rjgt	2026-03-06 17:20:41.696	2026-03-06 17:20:41.696
cmmf5un9j004vq3o9fymfcjmb	cmmf5u33t000zq3o96nn7do64	2026-03-06 17:20:42.056	2026-03-06 17:20:42.056
cmmf5unjj004zq3o9aibew2kg	cmmf5u3xp0010q3o93s59an8h	2026-03-06 17:20:42.416	2026-03-06 17:20:42.416
cmmf5vjn70003miq431hhxnjk	cmmf5tv2b000qq3o9l7p2v3jr	2026-03-06 17:21:24.019	2026-03-06 17:21:24.019
cmmf72g9v0005xfswbypla2xm	cmmf71xgp0001xfswrrah6w4v	2026-03-06 17:54:45.86	2026-03-06 17:54:45.86
cmmfb8qeb00061u7i2ydfree8	cmmfb8gxi00021u7i217bl1xk	2026-03-06 19:51:37.38	2026-03-06 19:51:37.38
cmmg3gtpy00068ekxrumsutgu	cmmg3gni200028ekxddxl6g2g	2026-03-07 09:01:44.182	2026-03-07 09:01:44.182
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "productId", quantity, "createdAt", "updatedAt") FROM stdin;
cmmf5ul160041q3o9rst87duv	cmmf5ukr6003zq3o910kcqyq3	cmmf5ue1y001hq3o9h181vvtr	2	2026-03-06 17:20:39.162	2026-03-06 17:20:39.162
cmmf5ulg50045q3o9x9thdnmy	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uebz001jq3o9hwr0e0tk	2	2026-03-06 17:20:39.702	2026-03-06 17:20:39.702
cmmf5ulq60049q3o96gv9miwj	cmmf5ull60047q3o9mrbpewli	cmmf5ueh0001lq3o97s70dnt4	2	2026-03-06 17:20:40.062	2026-03-06 17:20:40.062
cmmf5um0b004dq3o934r7etvb	cmmf5ulva004bq3o93mn15owp	cmmf5uem3001nq3o9uyt2hgk9	2	2026-03-06 17:20:40.427	2026-03-06 17:20:40.427
cmmf5umab004hq3o9fx48ck28	cmmf5um5b004fq3o95pxb2ck4	cmmf5uer4001pq3o99qn7mt5e	2	2026-03-06 17:20:40.788	2026-03-06 17:20:40.788
cmmf5umke004lq3o9ep7jz0qz	cmmf5umfd004jq3o93556j3j2	cmmf5uew4001rq3o9m1rmsr4n	2	2026-03-06 17:20:41.151	2026-03-06 17:20:41.151
cmmf5umug004pq3o9acgjgekh	cmmf5umpg004nq3o91ic21u41	cmmf5uf15001tq3o9j7pm0zyz	2	2026-03-06 17:20:41.513	2026-03-06 17:20:41.513
cmmf5un4j004tq3o94l6nvjqp	cmmf5umzj004rq3o978xcalgo	cmmf5uf65001vq3o92wtk1wzj	2	2026-03-06 17:20:41.876	2026-03-06 17:20:41.876
cmmf5unej004xq3o9xyf72uw0	cmmf5un9j004vq3o9fymfcjmb	cmmf5ufb5001xq3o9rkdn8gg1	2	2026-03-06 17:20:42.235	2026-03-06 17:20:42.235
cmmf5unoj0051q3o9xk3cl6pi	cmmf5unjj004zq3o9aibew2kg	cmmf5ufg7001zq3o99y927ypv	2	2026-03-06 17:20:42.595	2026-03-06 17:20:42.595
cmmfc0h3z0004hfew46zpzl6q	cmmfb8qeb00061u7i2ydfree8	cmmf5uhoi002tq3o94wxj6miq	2	2026-03-06 20:13:11.711	2026-03-06 20:13:15.722
cmmg2q9kt001rcszp2xvdit6a	cmmf5ukr6003zq3o910kcqyq3	cmmg2q5ul001hcszpejuij315	2	2026-03-07 08:41:05.021	2026-03-07 08:41:05.021
cmmg2qb8p001vcszp5nnj9c3z	cmmf5ulb50043q3o9o4c6aw2m	cmmg2q63v001jcszp3jwjsh8y	2	2026-03-07 08:41:07.177	2026-03-07 08:41:07.177
cmmg2qcnf001zcszpzvuhr2e6	cmmf5ull60047q3o9mrbpewli	cmmg2q68j001lcszpdmmi208y	2	2026-03-07 08:41:09.003	2026-03-07 08:41:09.003
cmmg2qdxi0023cszp23h9ypck	cmmf5ulva004bq3o93mn15owp	cmmg2q6d8001ncszpxykxkm3z	2	2026-03-07 08:41:10.662	2026-03-07 08:41:10.662
cmmg36wuk001rgj8tq7u0s5s5	cmmf5ukr6003zq3o910kcqyq3	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 08:54:01.677	2026-03-07 08:54:01.677
cmmg36ym3001vgj8tq9gkr5v6	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 08:54:03.963	2026-03-07 08:54:03.963
cmmg36zyw001zgj8to2a3o8bd	cmmf5ull60047q3o9mrbpewli	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-07 08:54:05.72	2026-03-07 08:54:05.72
cmmg372t80027gj8t1526urql	cmmf5um5b004fq3o95pxb2ck4	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 08:54:09.404	2026-03-07 08:54:09.404
cmmg37461002bgj8tfpyr073a	cmmf5umfd004jq3o93556j3j2	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 08:54:11.162	2026-03-07 08:54:11.162
cmmg375iu002fgj8tv5n8fbcj	cmmf5umpg004nq3o91ic21u41	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-07 08:54:12.918	2026-03-07 08:54:12.918
cmmg3770k002jgj8t013kkon5	cmmf5umzj004rq3o978xcalgo	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 08:54:14.852	2026-03-07 08:54:14.852
cmmg378df002ngj8ttliherv6	cmmf5un9j004vq3o9fymfcjmb	cmmg2q68j001lcszpdmmi208y	1	2026-03-07 08:54:16.611	2026-03-07 08:54:16.611
cmmg63psp0023gnmf7l2v40zq	cmmf5ulva004bq3o93mn15owp	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-07 10:15:31.418	2026-03-07 10:15:31.418
cmmg4ac5m001r8eejqzdlnxhx	cmmf5ukr6003zq3o910kcqyq3	cmmf5ufg7001zq3o99y927ypv	1	2026-03-07 09:24:41.098	2026-03-07 09:24:41.098
cmmg4adyi001v8eej9yrwhpbf	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 09:24:43.434	2026-03-07 09:24:43.434
cmmg4afcf001z8eej3p4zcq3f	cmmf5ull60047q3o9mrbpewli	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 09:24:45.232	2026-03-07 09:24:45.232
cmmg4agqi00238eej3m5ff021	cmmf5ulva004bq3o93mn15owp	cmmf5ufg7001zq3o99y927ypv	1	2026-03-07 09:24:47.034	2026-03-07 09:24:47.034
cmmg4ai4i00278eejyymfrhn3	cmmf5um5b004fq3o95pxb2ck4	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 09:24:48.835	2026-03-07 09:24:48.835
cmmg4ajng002b8eejcjprzh6o	cmmf5umfd004jq3o93556j3j2	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-07 09:24:50.633	2026-03-07 09:24:50.633
cmmg4al1e002f8eejjo94wcjj	cmmf5umpg004nq3o91ic21u41	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 09:24:52.61	2026-03-07 09:24:52.61
cmmg4amfb002j8eej73vydcl6	cmmf5umzj004rq3o978xcalgo	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 09:24:54.408	2026-03-07 09:24:54.408
cmmg4ant8002n8eejsvmz1off	cmmf5un9j004vq3o9fymfcjmb	cmmg2q5ul001hcszpejuij315	1	2026-03-07 09:24:56.204	2026-03-07 09:24:56.204
cmmg4ap74002r8eej00tnc40f	cmmf5unjj004zq3o9aibew2kg	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-07 09:24:58	2026-03-07 09:24:58
cmmg4s4g9001r43jbmhagl8ey	cmmf5ukr6003zq3o910kcqyq3	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 09:38:30.922	2026-03-07 09:38:30.922
cmmg4s67w001v43jblbseqtqz	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 09:38:33.213	2026-03-07 09:38:33.213
cmmg4s92r002343jb9ay27ut7	cmmf5ulva004bq3o93mn15owp	cmmg2q68j001lcszpdmmi208y	1	2026-03-07 09:38:36.916	2026-03-07 09:38:36.916
cmmg4safr002743jbekm1bdew	cmmf5um5b004fq3o95pxb2ck4	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 09:38:38.679	2026-03-07 09:38:38.679
cmmg4sbsp002b43jbg9mp8q1w	cmmf5umfd004jq3o93556j3j2	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-07 09:38:40.442	2026-03-07 09:38:40.442
cmmg4sd5q002f43jb4tajmz5d	cmmf5umpg004nq3o91ic21u41	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-07 09:38:42.207	2026-03-07 09:38:42.207
cmmg4sg0l002n43jb9x19ymt9	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-07 09:38:45.909	2026-03-07 09:38:45.909
cmmg4shdj002r43jbv11fun4t	cmmf5unjj004zq3o9aibew2kg	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 09:38:47.671	2026-03-07 09:38:47.671
cmmg53ypm001r2jgo6c7edv2g	cmmf5ukr6003zq3o910kcqyq3	cmmf5ugpd002hq3o9m67047db	1	2026-03-07 09:47:43.354	2026-03-07 09:47:43.354
cmmg540hv001v2jgoauyof96v	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-07 09:47:45.667	2026-03-07 09:47:45.667
cmmg541vb001z2jgog003i2tx	cmmf5ull60047q3o9mrbpewli	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-07 09:47:47.447	2026-03-07 09:47:47.447
cmmg5438o00232jgos9tp86o7	cmmf5ulva004bq3o93mn15owp	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 09:47:49.225	2026-03-07 09:47:49.225
cmmg544m400272jgorsyox64d	cmmf5um5b004fq3o95pxb2ck4	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-07 09:47:51.004	2026-03-07 09:47:51.004
cmmg545zo002b2jgo2jq7n5vp	cmmf5umfd004jq3o93556j3j2	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 09:47:52.789	2026-03-07 09:47:52.789
cmmg547i2002f2jgo9ig5mugi	cmmf5umpg004nq3o91ic21u41	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 09:47:54.569	2026-03-07 09:47:54.569
cmmg548vk002j2jgopmdqz7w5	cmmf5umzj004rq3o978xcalgo	cmmf5ugpd002hq3o9m67047db	1	2026-03-07 09:47:56.528	2026-03-07 09:47:56.528
cmmg54a8x002n2jgo7uukft3x	cmmf5un9j004vq3o9fymfcjmb	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 09:47:58.306	2026-03-07 09:47:58.306
cmmg54bmb002r2jgobzrktwis	cmmf5unjj004zq3o9aibew2kg	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 09:48:00.083	2026-03-07 09:48:00.083
cmmg63l5o001rgnmftchxdxhd	cmmf5ukr6003zq3o910kcqyq3	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 10:15:25.404	2026-03-07 10:15:25.404
cmmg63mze001vgnmfmec9e75q	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 10:15:27.771	2026-03-07 10:15:27.771
cmmg63oe1001zgnmfgwrsrov3	cmmf5ull60047q3o9mrbpewli	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 10:15:29.593	2026-03-07 10:15:29.593
cmmg63rcj0027gnmf9cl9rjbb	cmmf5um5b004fq3o95pxb2ck4	cmmg2q5ul001hcszpejuij315	1	2026-03-07 10:15:33.244	2026-03-07 10:15:33.244
cmmg63sr7002bgnmfqaeemrt9	cmmf5umfd004jq3o93556j3j2	cmmg2q5ul001hcszpejuij315	1	2026-03-07 10:15:35.252	2026-03-07 10:15:35.252
cmmg63vpj002jgnmfgln0ymwq	cmmf5umzj004rq3o978xcalgo	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-07 10:15:39.079	2026-03-07 10:15:39.079
cmmg63x46002ngnmfpvt0s6jl	cmmf5un9j004vq3o9fymfcjmb	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 10:15:40.902	2026-03-07 10:15:40.902
cmmg63yin002rgnmfvzs6sqoo	cmmf5unjj004zq3o9aibew2kg	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 10:15:42.72	2026-03-07 10:15:42.72
cmmg6ideg001rm2ycsynpm7d4	cmmf5ukr6003zq3o910kcqyq3	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 10:26:55.193	2026-03-07 10:26:55.193
cmmg6if70001vm2ycpfpby0iu	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 10:26:57.35	2026-03-07 10:26:57.35
cmmg6ighb001zm2ycrl3uwzgq	cmmf5ull60047q3o9mrbpewli	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-07 10:26:59.183	2026-03-07 10:26:59.183
cmmg6ihrh0023m2ychr4ciz6c	cmmf5ulva004bq3o93mn15owp	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 10:27:00.846	2026-03-07 10:27:00.846
cmmg6ij1l0027m2yc6cssono1	cmmf5um5b004fq3o95pxb2ck4	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 10:27:02.505	2026-03-07 10:27:02.505
cmmg6ikbr002bm2ycgv5dgvht	cmmf5umfd004jq3o93556j3j2	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 10:27:04.167	2026-03-07 10:27:04.167
cmmg6illw002fm2ycumzkgxt7	cmmf5umpg004nq3o91ic21u41	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 10:27:05.828	2026-03-07 10:27:05.828
cmmg6imw1002jm2yckh7cslis	cmmf5umzj004rq3o978xcalgo	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 10:27:07.489	2026-03-07 10:27:07.489
cmmg6io64002nm2yc3y0j7ry1	cmmf5un9j004vq3o9fymfcjmb	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 10:27:09.148	2026-03-07 10:27:09.148
cmmg6ipg8002rm2ycfoy6ldsn	cmmf5unjj004zq3o9aibew2kg	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-07 10:27:10.809	2026-03-07 10:27:10.809
cmmg9zf0u002f4jt72fp8a05r	cmmf5umpg004nq3o91ic21u41	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 12:04:09.294	2026-03-07 12:04:09.294
cmmg7mlu4001rcbrzgjeeo6uq	cmmf5ukr6003zq3o910kcqyq3	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 10:58:12.364	2026-03-07 10:58:12.364
cmmg7mnn1001vcbrz0rs2g6t1	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-07 10:58:14.702	2026-03-07 10:58:14.702
cmmg7mp0t001zcbrz1xt3ckmx	cmmf5ull60047q3o9mrbpewli	cmmf5ugpd002hq3o9m67047db	1	2026-03-07 10:58:16.493	2026-03-07 10:58:16.493
cmmg7mqep0023cbrz6kbw0i67	cmmf5ulva004bq3o93mn15owp	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-07 10:58:18.289	2026-03-07 10:58:18.289
cmmg7mrsh0027cbrzsud6q5zr	cmmf5um5b004fq3o95pxb2ck4	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-07 10:58:20.081	2026-03-07 10:58:20.081
cmmg7mtba002bcbrz63e1tnwd	cmmf5umfd004jq3o93556j3j2	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-07 10:58:21.876	2026-03-07 10:58:21.876
cmmg7mup3002fcbrznx835yaa	cmmf5umpg004nq3o91ic21u41	cmmf5ufg7001zq3o99y927ypv	1	2026-03-07 10:58:23.848	2026-03-07 10:58:23.848
cmmg7mw2x002jcbrzpgktemkx	cmmf5umzj004rq3o978xcalgo	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 10:58:25.641	2026-03-07 10:58:25.641
cmmg7mxgt002ncbrzo7kgw2tf	cmmf5un9j004vq3o9fymfcjmb	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-07 10:58:27.437	2026-03-07 10:58:27.437
cmmg7myuj002rcbrzuzadhqjp	cmmf5unjj004zq3o9aibew2kg	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 10:58:29.227	2026-03-07 10:58:29.227
cmmg9zgb2002j4jt7g8nfu5u2	cmmf5umzj004rq3o978xcalgo	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-07 12:04:10.958	2026-03-07 12:04:10.958
cmmg85k1n001vrs2fn3wrbmnd	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 11:12:56.507	2026-03-07 11:12:56.507
cmmg85lk9001zrs2fl2ua8ovj	cmmf5ull60047q3o9mrbpewli	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 11:12:58.473	2026-03-07 11:12:58.473
cmmg85mxx0023rs2fvovk3vta	cmmf5ulva004bq3o93mn15owp	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 11:13:00.261	2026-03-07 11:13:00.261
cmmg85obj0027rs2f3nspmism	cmmf5um5b004fq3o95pxb2ck4	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-07 11:13:02.048	2026-03-07 11:13:02.048
cmmg85pu5002brs2fpnxu9zbl	cmmf5umfd004jq3o93556j3j2	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 11:13:03.835	2026-03-07 11:13:03.835
cmmg85r7s002frs2frp6y84x5	cmmf5umpg004nq3o91ic21u41	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-07 11:13:05.801	2026-03-07 11:13:05.801
cmmg85sle002jrs2fph5ufxxo	cmmf5umzj004rq3o978xcalgo	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 11:13:07.586	2026-03-07 11:13:07.586
cmmg85tz0002nrs2f8wdubsot	cmmf5un9j004vq3o9fymfcjmb	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 11:13:09.373	2026-03-07 11:13:09.373
cmmg85vcn002rrs2fzw6ft4tn	cmmf5unjj004zq3o9aibew2kg	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-07 11:13:11.159	2026-03-07 11:13:11.159
cmmg9zhl8002n4jt7hb77qe2n	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 12:04:12.62	2026-03-07 12:04:12.62
cmmg8srfb001rl3rcmvt1sb49	cmmf5ukr6003zq3o910kcqyq3	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 11:30:59.159	2026-03-07 11:30:59.159
cmmg8st4j001vl3rcejh8otw7	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 11:31:01.364	2026-03-07 11:31:01.364
cmmg8sx620027l3rc2omckoel	cmmf5um5b004fq3o95pxb2ck4	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-07 11:31:06.602	2026-03-07 11:31:06.602
cmmg8szso002fl3rc237fdxix	cmmf5umpg004nq3o91ic21u41	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 11:31:10.008	2026-03-07 11:31:10.008
cmmg8t17w002jl3rccd91v5hk	cmmf5umzj004rq3o978xcalgo	cmmg2q5ul001hcszpejuij315	1	2026-03-07 11:31:11.685	2026-03-07 11:31:11.685
cmmg8t2ii002nl3rcyrz8f6y3	cmmf5un9j004vq3o9fymfcjmb	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 11:31:13.53	2026-03-07 11:31:13.53
cmmg8t3uy002rl3rc5rcsfsvi	cmmf5unjj004zq3o9aibew2kg	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 11:31:15.274	2026-03-07 11:31:15.274
cmmg95059001vd2vhgofbq3g1	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 11:40:30.334	2026-03-07 11:40:30.334
cmmg951os001zd2vhjcnvdh9x	cmmf5ull60047q3o9mrbpewli	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-07 11:40:32.332	2026-03-07 11:40:32.332
cmmg9532p0023d2vh4p9q2tqw	cmmf5ulva004bq3o93mn15owp	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-07 11:40:34.129	2026-03-07 11:40:34.129
cmmg954gf0027d2vhyt9hd0v3	cmmf5um5b004fq3o95pxb2ck4	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 11:40:35.919	2026-03-07 11:40:35.919
cmmg955za002bd2vhweu5t14h	cmmf5umfd004jq3o93556j3j2	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-07 11:40:37.717	2026-03-07 11:40:37.717
cmmg958r6002jd2vh16eascxd	cmmf5umzj004rq3o978xcalgo	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 11:40:41.49	2026-03-07 11:40:41.49
cmmg95bis002rd2vh6o79hcjg	cmmf5unjj004zq3o9aibew2kg	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-07 11:40:45.076	2026-03-07 11:40:45.076
cmmg9mnxh001vc8cng77wx3qj	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-07 11:54:14.309	2026-03-07 11:54:14.309
cmmg9mpf4001zc8cn82xm02eg	cmmf5ull60047q3o9mrbpewli	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 11:54:16.241	2026-03-07 11:54:16.241
cmmg9mqrw0023c8cn2wuw8grw	cmmf5ulva004bq3o93mn15owp	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 11:54:17.996	2026-03-07 11:54:17.996
cmmg9ms4n0027c8cn62lwnyg7	cmmf5um5b004fq3o95pxb2ck4	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 11:54:19.752	2026-03-07 11:54:19.752
cmmg9muub002fc8cnl4crbada	cmmf5umpg004nq3o91ic21u41	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-07 11:54:23.267	2026-03-07 11:54:23.267
cmmg9mwby002jc8cnxtqbaxyl	cmmf5umzj004rq3o978xcalgo	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 11:54:25.198	2026-03-07 11:54:25.198
cmmg9z8h2001v4jt7gfhuesue	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-07 12:04:00.807	2026-03-07 12:04:00.807
cmmg9z9vz001z4jt70m5l86mk	cmmf5ull60047q3o9mrbpewli	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 12:04:02.64	2026-03-07 12:04:02.64
cmmga3dpg001rblu5mfar92gt	cmmf5ukr6003zq3o910kcqyq3	cmmg2q68j001lcszpdmmi208y	1	2026-03-07 12:07:14.212	2026-03-07 12:07:14.212
cmmga3ieb0023blu5lf9410m4	cmmf5ulva004bq3o93mn15owp	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 12:07:20.291	2026-03-07 12:07:20.291
cmmga3jrz0027blu5q73p5099	cmmf5um5b004fq3o95pxb2ck4	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-07 12:07:22.079	2026-03-07 12:07:22.079
cmmga3mo8002fblu519ulyfdi	cmmf5umpg004nq3o91ic21u41	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 12:07:25.833	2026-03-07 12:07:25.833
cmmga3o1w002jblu5krj5awkv	cmmf5umzj004rq3o978xcalgo	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 12:07:27.621	2026-03-07 12:07:27.621
cmmga3pfm002nblu5geqh44ka	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 12:07:29.41	2026-03-07 12:07:29.41
cmmga3qt8002rblu521qy3cs1	cmmf5unjj004zq3o9aibew2kg	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-07 12:07:31.197	2026-03-07 12:07:31.197
cmmgb8pce001z1o2x8cogqcfj	cmmf5ull60047q3o9mrbpewli	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-07 12:39:22.19	2026-03-07 12:39:22.19
cmmgb8tbi002b1o2xjagumbr9	cmmf5umfd004jq3o93556j3j2	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-07 12:39:27.342	2026-03-07 12:39:27.342
cmmgb8uly002f1o2xe88goz3t	cmmf5umpg004nq3o91ic21u41	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 12:39:29.015	2026-03-07 12:39:29.015
cmmgb8vw3002j1o2xqvr7q7r2	cmmf5umzj004rq3o978xcalgo	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 12:39:30.675	2026-03-07 12:39:30.675
cmmgb8x69002n1o2x9vi7di3y	cmmf5un9j004vq3o9fymfcjmb	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 12:39:32.337	2026-03-07 12:39:32.337
cmmgbvt6m001r138bb3peae1y	cmmf5ukr6003zq3o910kcqyq3	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-07 12:57:20.254	2026-03-07 12:57:20.254
cmmgbvuyu001v138bqn0i7urj	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 12:57:22.566	2026-03-07 12:57:22.566
cmmgbvwc8001z138b3flfrsut	cmmf5ull60047q3o9mrbpewli	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 12:57:24.344	2026-03-07 12:57:24.344
cmmgbvxpm0023138bcgxqwqpm	cmmf5ulva004bq3o93mn15owp	cmmf5ugpd002hq3o9m67047db	1	2026-03-07 12:57:26.122	2026-03-07 12:57:26.122
cmmgbw0l9002b138bredpa0ax	cmmf5umfd004jq3o93556j3j2	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-07 12:57:29.853	2026-03-07 12:57:29.853
cmmgbw4ub002n138blrl2cbfw	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 12:57:35.364	2026-03-07 12:57:35.364
cmmgd0qft001rh4js3w2e2met	cmmf5ukr6003zq3o910kcqyq3	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-07 13:29:09.594	2026-03-07 13:29:09.594
cmmgd0s8m001vh4jszwd6ws79	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-07 13:29:11.927	2026-03-07 13:29:11.927
cmmgd0tiy001zh4jsei9r9ap8	cmmf5ull60047q3o9mrbpewli	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-07 13:29:13.594	2026-03-07 13:29:13.594
cmmgd0ut70023h4jsllppxyhk	cmmf5ulva004bq3o93mn15owp	cmmf5ugab002bq3o9n75vkax9	1	2026-03-07 13:29:15.26	2026-03-07 13:29:15.26
cmmgd0w3i0027h4js823sl6qt	cmmf5um5b004fq3o95pxb2ck4	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-07 13:29:16.926	2026-03-07 13:29:16.926
cmmgd0ysh002fh4jsqb1936ts	cmmf5umpg004nq3o91ic21u41	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-07 13:29:20.417	2026-03-07 13:29:20.417
cmmgd102l002jh4jsk8qqfftz	cmmf5umzj004rq3o978xcalgo	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 13:29:22.077	2026-03-07 13:29:22.077
cmmgd11cs002nh4jszyeom7fo	cmmf5un9j004vq3o9fymfcjmb	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 13:29:23.741	2026-03-07 13:29:23.741
cmmgdraiz001rnxocnrefgf47	cmmf5ukr6003zq3o910kcqyq3	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 13:49:48.683	2026-03-07 13:49:48.683
cmmgdrds7001znxocke17sy6b	cmmf5ull60047q3o9mrbpewli	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 13:49:52.903	2026-03-07 13:49:52.903
cmmgdrf530023nxoco3ffzsm0	cmmf5ulva004bq3o93mn15owp	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 13:49:54.663	2026-03-07 13:49:54.663
cmmgdrghx0027nxoceda84ua3	cmmf5um5b004fq3o95pxb2ck4	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-07 13:49:56.421	2026-03-07 13:49:56.421
cmmgdrj7p002fnxocf17keshw	cmmf5umpg004nq3o91ic21u41	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-07 13:49:59.941	2026-03-07 13:49:59.941
cmmgdrm2b002nnxochvc633lo	cmmf5un9j004vq3o9fymfcjmb	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-07 13:50:03.636	2026-03-07 13:50:03.636
cmmgdrnf4002rnxocfkdk7y9r	cmmf5unjj004zq3o9aibew2kg	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 13:50:05.393	2026-03-07 13:50:05.393
cmmge3bet001r13knfgg0blb9	cmmf5ukr6003zq3o910kcqyq3	cmmf5ugab002bq3o9n75vkax9	1	2026-03-07 13:59:09.702	2026-03-07 13:59:09.702
cmmge3d6o001v13kn77y65vbb	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ugpd002hq3o9m67047db	1	2026-03-07 13:59:12.001	2026-03-07 13:59:12.001
cmmge3ejv001z13kn4aahj7je	cmmf5ull60047q3o9mrbpewli	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 13:59:13.772	2026-03-07 13:59:13.772
cmmge3hf4002713kntxvhvgj3	cmmf5um5b004fq3o95pxb2ck4	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-07 13:59:17.488	2026-03-07 13:59:17.488
cmmge3isd002b13knx5x3mkmh	cmmf5umfd004jq3o93556j3j2	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-07 13:59:19.261	2026-03-07 13:59:19.261
cmmge3kag002f13knw43njwfi	cmmf5umpg004nq3o91ic21u41	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-07 13:59:21.208	2026-03-07 13:59:21.208
cmmge3lnr002j13kns4lpkl05	cmmf5umzj004rq3o978xcalgo	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 13:59:22.984	2026-03-07 13:59:22.984
cmmgey95y001r1ro1dc8vrluh	cmmf5ukr6003zq3o910kcqyq3	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 14:23:13.127	2026-03-07 14:23:13.127
cmmgeyi20002f1ro155ey88pp	cmmf5umpg004nq3o91ic21u41	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 14:23:24.471	2026-03-07 14:23:24.471
cmmgeyjf6002j1ro1eutzh9r0	cmmf5umzj004rq3o978xcalgo	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 14:23:26.419	2026-03-07 14:23:26.419
cmmgeyksd002n1ro1amyt6yxg	cmmf5un9j004vq3o9fymfcjmb	cmmf5ufg7001zq3o99y927ypv	1	2026-03-07 14:23:28.19	2026-03-07 14:23:28.19
cmmgeym5l002r1ro19om25d0c	cmmf5unjj004zq3o9aibew2kg	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-07 14:23:29.961	2026-03-07 14:23:29.961
cmmgf4fg2001vw48jet13h1o3	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 14:28:01.202	2026-03-07 14:28:01.202
cmmgf4gys001zw48jqyq84qyd	cmmf5ull60047q3o9mrbpewli	cmmf5uidu0033q3o95zgak4xj	1	2026-03-07 14:28:03.172	2026-03-07 14:28:03.172
cmmgf4icm0023w48jkpr9uhy8	cmmf5ulva004bq3o93mn15owp	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-07 14:28:04.966	2026-03-07 14:28:04.966
cmmgf4l8t002bw48jmn89ji0r	cmmf5umfd004jq3o93556j3j2	cmmf5ugfc002dq3o936gsedol	1	2026-03-07 14:28:08.539	2026-03-07 14:28:08.539
cmmgffyec001vwghkxaqdmj44	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-07 14:36:58.814	2026-03-07 14:36:58.814
cmmgffzt1001zwghk9bfe1iar	cmmf5ull60047q3o9mrbpewli	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 14:37:00.806	2026-03-07 14:37:00.806
cmmgfg3nc002bwghkmal7x9dg	cmmf5umfd004jq3o93556j3j2	cmmf5ug090027q3o9phnv91bn	1	2026-03-07 14:37:05.784	2026-03-07 14:37:05.784
cmmgfg67l002jwghkxazgrtfn	cmmf5umzj004rq3o978xcalgo	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-07 14:37:09.106	2026-03-07 14:37:09.106
cmmgfg8s3002rwghkzikbt6wh	cmmf5unjj004zq3o9aibew2kg	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 14:37:12.435	2026-03-07 14:37:12.435
cmmgggwtc001rsyrlpyi1p7py	cmmf5ukr6003zq3o910kcqyq3	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 15:05:43.2	2026-03-07 15:05:43.2
cmmgggylv001vsyrlecaswbr8	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 15:05:45.523	2026-03-07 15:05:45.523
cmmgggzzf001zsyrlymoln1b0	cmmf5ull60047q3o9mrbpewli	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-07 15:05:47.307	2026-03-07 15:05:47.307
cmmggh1cz0023syrljpx0ztto	cmmf5ulva004bq3o93mn15owp	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-07 15:05:49.092	2026-03-07 15:05:49.092
cmmggh491002bsyrlf4n7foy8	cmmf5umfd004jq3o93556j3j2	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-07 15:05:52.838	2026-03-07 15:05:52.838
cmmggh753002jsyrl7h3fvvyl	cmmf5umzj004rq3o978xcalgo	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-07 15:05:56.584	2026-03-07 15:05:56.584
cmmggh8iq002nsyrl2rxkzs27	cmmf5un9j004vq3o9fymfcjmb	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-07 15:05:58.37	2026-03-07 15:05:58.37
cmmggvh0m001r12qsnxlkmy41	cmmf5ukr6003zq3o910kcqyq3	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 15:17:02.567	2026-03-07 15:17:02.567
cmmggvit6001v12qsvnw0m22b	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-07 15:17:04.891	2026-03-07 15:17:04.891
cmmggvk6x001z12qsc1ahr2od	cmmf5ull60047q3o9mrbpewli	cmmf5ugze002lq3o9qb80h1ol	1	2026-03-07 15:17:06.681	2026-03-07 15:17:06.681
cmmggvlkm002312qsr8pzzs2i	cmmf5ulva004bq3o93mn15owp	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-07 15:17:08.47	2026-03-07 15:17:08.47
cmmggvmyb002712qsyjz4i4um	cmmf5um5b004fq3o95pxb2ck4	cmmf5ufg7001zq3o99y927ypv	1	2026-03-07 15:17:10.26	2026-03-07 15:17:10.26
cmmggvogx002b12qsfgr609kf	cmmf5umfd004jq3o93556j3j2	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-07 15:17:12.047	2026-03-07 15:17:12.047
cmmggvrd7002j12qscnm95cqq	cmmf5umzj004rq3o978xcalgo	cmmg2q68j001lcszpdmmi208y	1	2026-03-07 15:17:15.979	2026-03-07 15:17:15.979
cmmggvsqv002n12qsokc8dqyt	cmmf5un9j004vq3o9fymfcjmb	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-07 15:17:17.767	2026-03-07 15:17:17.767
cmmggvu4h002r12qsfh69bu4n	cmmf5unjj004zq3o9aibew2kg	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-07 15:17:19.553	2026-03-07 15:17:19.553
cmmghhtn0001rs81jnm79zjnw	cmmf5ukr6003zq3o910kcqyq3	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-07 15:34:25.356	2026-03-07 15:34:25.356
cmmghhwr2001zs81jscm0rn3o	cmmf5ull60047q3o9mrbpewli	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-07 15:34:29.39	2026-03-07 15:34:29.39
cmmghhy1j0023s81j7er2m04z	cmmf5ulva004bq3o93mn15owp	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-07 15:34:31.063	2026-03-07 15:34:31.063
cmmgi138v001ra16jq57sgaqs	cmmf5ukr6003zq3o910kcqyq3	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-07 15:49:24.271	2026-03-07 15:49:24.271
cmmgi17ut0023a16jm82p6foy	cmmf5ulva004bq3o93mn15owp	cmmg2q5ul001hcszpejuij315	1	2026-03-07 15:49:30.245	2026-03-07 15:49:30.245
cmmgi197n0027a16jsylwqyl3	cmmf5um5b004fq3o95pxb2ck4	cmmf5ui8q0031q3o97jervsi0	1	2026-03-07 15:49:32.003	2026-03-07 15:49:32.003
cmmgi1akf002ba16j0ym8ybcn	cmmf5umfd004jq3o93556j3j2	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-07 15:49:33.76	2026-03-07 15:49:33.76
cmmgi1bxc002fa16j9s7bq1pl	cmmf5umpg004nq3o91ic21u41	cmmg2q68j001lcszpdmmi208y	1	2026-03-07 15:49:35.52	2026-03-07 15:49:35.52
cmmgi1ert002na16jrkklqta4	cmmf5un9j004vq3o9fymfcjmb	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-07 15:49:39.209	2026-03-07 15:49:39.209
cmmgimgpv001vzunf5qjanr0h	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-07 16:06:01.507	2026-03-07 16:06:01.507
cmmgimi8r001zzunfx6r2jy4w	cmmf5ull60047q3o9mrbpewli	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-07 16:06:03.483	2026-03-07 16:06:03.483
cmmgiml0d0027zunf4yw0cv69	cmmf5um5b004fq3o95pxb2ck4	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-07 16:06:07.07	2026-03-07 16:06:07.07
cmmgimmjc002bzunfqwv99f7g	cmmf5umfd004jq3o93556j3j2	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-07 16:06:08.869	2026-03-07 16:06:08.869
cmmgimnxh002fzunfw9m0okge	cmmf5umpg004nq3o91ic21u41	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-07 16:06:10.854	2026-03-07 16:06:10.854
cmmgimqpg002nzunfnl41xbju	cmmf5un9j004vq3o9fymfcjmb	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-07 16:06:14.452	2026-03-07 16:06:14.452
cmmhcdu3e001r14cwujyb1x3d	cmmf5ukr6003zq3o910kcqyq3	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-08 05:59:07.419	2026-03-08 05:59:07.419
cmmhce1fo002b14cwa7t8ixga	cmmf5umfd004jq3o93556j3j2	cmmg2q68j001lcszpdmmi208y	1	2026-03-08 05:59:16.932	2026-03-08 05:59:16.932
cmmhcqzpg001rbyt448a78lyn	cmmf5ukr6003zq3o910kcqyq3	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-08 06:09:21.221	2026-03-08 06:09:21.221
cmmhcr4ax0023byt4a8nd7j15	cmmf5ulva004bq3o93mn15owp	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-08 06:09:27.177	2026-03-08 06:09:27.177
cmmhcr5nl0027byt4es2dypeu	cmmf5um5b004fq3o95pxb2ck4	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-08 06:09:28.93	2026-03-08 06:09:28.93
cmmhcr8cw002fbyt43i32ued1	cmmf5umpg004nq3o91ic21u41	cmmf5ugpd002hq3o9m67047db	1	2026-03-08 06:09:32.433	2026-03-08 06:09:32.433
cmmhcr9uh002jbyt43jt9fks4	cmmf5umzj004rq3o978xcalgo	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-08 06:09:34.361	2026-03-08 06:09:34.361
cmmhcwzst002ffrcdotvb6rmt	cmmf5umpg004nq3o91ic21u41	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-08 06:14:01.097	2026-03-08 06:14:01.097
cmmhcx1bw002jfrcdyk23a8af	cmmf5umzj004rq3o978xcalgo	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-08 06:14:03.26	2026-03-08 06:14:03.26
cmmhcx442002rfrcdy4mzhqua	cmmf5unjj004zq3o9aibew2kg	cmmf5ugfc002dq3o936gsedol	1	2026-03-08 06:14:06.867	2026-03-08 06:14:06.867
cmmhj3kx9001v7gmwhfaiycci	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-08 09:07:06.285	2026-03-08 09:07:06.285
cmmhj3mgr001z7gmwq02p17rk	cmmf5ull60047q3o9mrbpewli	cmmf5ugab002bq3o9n75vkax9	1	2026-03-08 09:07:08.284	2026-03-08 09:07:08.284
cmmhm1k0e001vlcc5js8luk3p	cmmf5ulb50043q3o9o4c6aw2m	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-08 10:29:30.639	2026-03-08 10:29:30.639
cmmhm1li7001zlcc5jglir613	cmmf5ull60047q3o9mrbpewli	cmmf5ufg7001zq3o99y927ypv	1	2026-03-08 10:29:32.576	2026-03-08 10:29:32.576
cmmhm1pl2002blcc5qjd3sk36	cmmf5umfd004jq3o93556j3j2	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-08 10:29:37.863	2026-03-08 10:29:37.863
cmmhm1tso002nlcc5e9rheawl	cmmf5un9j004vq3o9fymfcjmb	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-08 10:29:43.32	2026-03-08 10:29:43.32
cmmhmdpd0001zvigtjx5csti4	cmmf5ull60047q3o9mrbpewli	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-08 10:38:57.444	2026-03-08 10:38:57.444
cmmhnjut7001rpmqpirm8cyld	cmmf5ukr6003zq3o910kcqyq3	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-08 11:11:44.059	2026-03-08 11:11:44.059
cmmhnjwlu001vpmqpxrha1lne	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-08 11:11:46.386	2026-03-08 11:11:46.386
cmmhnk0vh0027pmqp3d88ar7a	cmmf5um5b004fq3o95pxb2ck4	cmmf5ug090027q3o9phnv91bn	1	2026-03-08 11:11:51.918	2026-03-08 11:11:51.918
cmmhp5134002313cczo80fldt	cmmf5ulva004bq3o93mn15owp	cmmf5ufl70021q3o9tzfwqcor	1	2026-03-08 11:56:11.584	2026-03-08 11:56:11.584
cmmhp53xk002b13ccgk5u11nd	cmmf5umfd004jq3o93556j3j2	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-08 11:56:15.272	2026-03-08 11:56:15.272
cmmhvpcpx001vf2hhne2ebta9	cmmf5ulb50043q3o9o4c6aw2m	cmmg2q5ul001hcszpejuij315	1	2026-03-08 14:59:57.311	2026-03-08 14:59:57.311
cmmhvpe4p001zf2hhyxgasay6	cmmf5ull60047q3o9mrbpewli	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-08 14:59:59.306	2026-03-08 14:59:59.306
cmmhvphz9002bf2hhgkb6f41r	cmmf5umfd004jq3o93556j3j2	cmmf5ufg7001zq3o99y927ypv	1	2026-03-08 15:00:04.293	2026-03-08 15:00:04.293
cmmhvpltn002nf2hhn6a6tdv4	cmmf5un9j004vq3o9fymfcjmb	cmmg2q6d8001ncszpxykxkm3z	1	2026-03-08 15:00:09.275	2026-03-08 15:00:09.275
cmmhw5qwt002b2tm1y1kjfre7	cmmf5umfd004jq3o93556j3j2	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-08 15:12:42.366	2026-03-08 15:12:42.366
cmmhw96640023hfkx9sqx79dm	cmmf5ulva004bq3o93mn15owp	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-08 15:15:22.108	2026-03-08 15:15:22.108
cmmhw9a5h002fhfkx7kpn9dff	cmmf5umpg004nq3o91ic21u41	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-08 15:15:27.269	2026-03-08 15:15:27.269
cmmhw9cpy002nhfkxjmdom30k	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugab002bq3o9n75vkax9	1	2026-03-08 15:15:30.598	2026-03-08 15:15:30.598
cmmhwjlsa001v6fzkfqvx22p4	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ugfc002dq3o936gsedol	1	2026-03-08 15:23:28.907	2026-03-08 15:23:28.907
cmmhwjoms00236fzkg5ib9vnh	cmmf5ulva004bq3o93mn15owp	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-08 15:23:32.596	2026-03-08 15:23:32.596
cmmhwjpzg00276fzkcs8nqdp1	cmmf5um5b004fq3o95pxb2ck4	cmmf5ufb5001xq3o9rkdn8gg1	1	2026-03-08 15:23:34.348	2026-03-08 15:23:34.348
cmmhwjsp6002f6fzkemeqymb0	cmmf5umpg004nq3o91ic21u41	cmmf5uidu0033q3o95zgak4xj	1	2026-03-08 15:23:37.867	2026-03-08 15:23:37.867
cmmhxetxa001r5l2n5nmv8bl6	cmmf5ukr6003zq3o910kcqyq3	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-08 15:47:45.79	2026-03-08 15:47:45.79
cmmhxf4e0002j5l2n7igzpr0n	cmmf5umzj004rq3o978xcalgo	cmmf5ugab002bq3o9n75vkax9	1	2026-03-08 15:47:59.352	2026-03-08 15:47:59.352
cmmhxf76l002r5l2nvf58m4te	cmmf5unjj004zq3o9aibew2kg	cmmf5uhtj002vq3o9fb6pwahy	1	2026-03-08 15:48:02.973	2026-03-08 15:48:02.973
cmmhxwba30023kn2cyu16eacg	cmmf5ulva004bq3o93mn15owp	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-08 16:01:21.435	2026-03-08 16:01:21.435
cmmhxwcsk0027kn2c9owoqo72	cmmf5um5b004fq3o95pxb2ck4	cmmf5ugfc002dq3o936gsedol	1	2026-03-08 16:01:23.396	2026-03-08 16:01:23.396
cmmhxwe67002bkn2c6yuxqwc1	cmmf5umfd004jq3o93556j3j2	cmmf5ugkc002fq3o9gy2rmwqg	1	2026-03-08 16:01:25.183	2026-03-08 16:01:25.183
cmmhxwh20002jkn2criacmxae	cmmf5umzj004rq3o978xcalgo	cmmf5ufg7001zq3o99y927ypv	1	2026-03-08 16:01:28.92	2026-03-08 16:01:28.92
cmmhy29zy001zjff2fe4hzwa5	cmmf5ull60047q3o9mrbpewli	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-08 16:05:59.711	2026-03-08 16:05:59.711
cmmhy2coy0027jff2bbru8vv7	cmmf5um5b004fq3o95pxb2ck4	cmmf5uidu0033q3o95zgak4xj	1	2026-03-08 16:06:03.203	2026-03-08 16:06:03.203
cmmhyjvd0001rk71e6h3gd76h	cmmf5ukr6003zq3o910kcqyq3	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-08 16:19:40.548	2026-03-08 16:19:40.548
cmmhyk2f0002bk71ei32h2xej	cmmf5umfd004jq3o93556j3j2	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-08 16:19:49.692	2026-03-08 16:19:49.692
cmmhyk4z9002jk71elol2jwo6	cmmf5umzj004rq3o978xcalgo	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-08 16:19:53.013	2026-03-08 16:19:53.013
cmmhyk69g002nk71eq1ue3uwd	cmmf5un9j004vq3o9fymfcjmb	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-08 16:19:54.677	2026-03-08 16:19:54.677
cmmhyw942002311aatjxeo3uk	cmmf5ulva004bq3o93mn15owp	cmmf5ui8q0031q3o97jervsi0	1	2026-03-08 16:29:18.242	2026-03-08 16:29:18.242
cmmhywbsz002b11aawlggcdgq	cmmf5umfd004jq3o93556j3j2	cmmf5ui8q0031q3o97jervsi0	1	2026-03-08 16:29:21.731	2026-03-08 16:29:21.731
cmmhywedb002j11aaaovaid5y	cmmf5umzj004rq3o978xcalgo	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-08 16:29:25.056	2026-03-08 16:29:25.056
cmmhywgxk002r11aa36sekzrc	cmmf5unjj004zq3o9aibew2kg	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-08 16:29:28.376	2026-03-08 16:29:28.376
cmmhzem1d002fgu3okwcje9no	cmmf5umpg004nq3o91ic21u41	cmmf5uh4g002nq3o9hsyyqatx	1	2026-03-08 16:43:34.802	2026-03-08 16:43:34.802
cmmhzq303001vqqpfq1hjpaju	cmmf5ulb50043q3o9o4c6aw2m	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-08 16:52:30.004	2026-03-08 16:52:30.004
cmmhzq4ir001zqqpf89qee2qw	cmmf5ull60047q3o9mrbpewli	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-08 16:52:31.971	2026-03-08 16:52:31.971
cmmhzq5wj0023qqpfmmxtys6a	cmmf5ulva004bq3o93mn15owp	cmmf5uhoi002tq3o94wxj6miq	1	2026-03-08 16:52:33.763	2026-03-08 16:52:33.763
cmmhzqebq002rqqpfdnvs0uov	cmmf5unjj004zq3o9aibew2kg	cmmf5ug090027q3o9phnv91bn	1	2026-03-08 16:52:44.679	2026-03-08 16:52:44.679
cmmi0wp0j001r18pnsaar7bva	cmmf5ukr6003zq3o910kcqyq3	cmmf5uew4001rq3o9m1rmsr4n	1	2026-03-08 17:25:38.084	2026-03-08 17:25:38.084
cmmi0wzxw002n18pnncz3mrtt	cmmf5un9j004vq3o9fymfcjmb	cmmf5uf65001vq3o92wtk1wzj	1	2026-03-08 17:25:52.244	2026-03-08 17:25:52.244
cmmi18aej002fcsshlemid1dx	cmmf5umpg004nq3o91ic21u41	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-08 17:34:39.019	2026-03-08 17:34:39.019
cmmiyaj47002by8sxrhqsk57v	cmmf5umfd004jq3o93556j3j2	cmmf5uem3001nq3o9uyt2hgk9	1	2026-03-09 09:00:10.951	2026-03-09 09:00:10.951
cmmiyam40002jy8sxrsl0ck2l	cmmf5umzj004rq3o978xcalgo	cmmf5uhyj002xq3o95hjy6ukk	1	2026-03-09 09:00:14.832	2026-03-09 09:00:14.832
cmmj06lze0023659gu1i992bj	cmmf5ulva004bq3o93mn15owp	cmmf5ugud002jq3o9rkh2tzcf	1	2026-03-09 09:53:07.274	2026-03-09 09:53:07.274
cmmj0bnns001rrrhnbs84gawm	cmmf5ukr6003zq3o910kcqyq3	cmmf5ufv80025q3o9cdtxfcwp	1	2026-03-09 09:57:02.729	2026-03-09 09:57:02.729
cmmj0btfq0027rrhnl81z5uek	cmmf5um5b004fq3o95pxb2ck4	cmmf5ueh0001lq3o97s70dnt4	1	2026-03-09 09:57:10.214	2026-03-09 09:57:10.214
cmmj0bw0a002frrhn2zkh2r3v	cmmf5umpg004nq3o91ic21u41	cmmf5ue1y001hq3o9h181vvtr	1	2026-03-09 09:57:13.546	2026-03-09 09:57:13.546
cmmj0wbuf0027z5dntrworkze	cmmf5um5b004fq3o95pxb2ck4	cmmf5ugpd002hq3o9m67047db	1	2026-03-09 10:13:07.192	2026-03-09 10:13:07.192
cmmj0whkb002nz5dna6v4tsha	cmmf5un9j004vq3o9fymfcjmb	cmmf5ugpd002hq3o9m67047db	1	2026-03-09 10:13:14.603	2026-03-09 10:13:14.603
cmmj14m7l001r13y3xn5sxmd5	cmmf5ukr6003zq3o910kcqyq3	cmmf5uh9h002pq3o9vz5wq495	1	2026-03-09 10:19:33.874	2026-03-09 10:19:33.874
cmmj14rz4002713y3aqcdznep	cmmf5um5b004fq3o95pxb2ck4	cmmf5uhjh002rq3o9494ad1nx	1	2026-03-09 10:19:41.344	2026-03-09 10:19:41.344
cmmm4nw4b002b10vddgxqbx7g	cmmf5umfd004jq3o93556j3j2	cmmf5ugab002bq3o9n75vkax9	1	2026-03-11 14:21:50.555	2026-03-11 14:21:50.555
cmmm4o1ud002r10vdl76nv311	cmmf5unjj004zq3o9aibew2kg	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-11 14:21:57.974	2026-03-11 14:21:57.974
cmmm55lgy002789vgbh4ko4ia	cmmf5um5b004fq3o95pxb2ck4	cmmf5ui3m002zq3o90u6qnq7i	1	2026-03-11 14:35:36.563	2026-03-11 14:35:36.563
cmmm55mza002b89vgeu3lgt3d	cmmf5umfd004jq3o93556j3j2	cmmf5uebz001jq3o9hwr0e0tk	1	2026-03-11 14:35:38.518	2026-03-11 14:35:38.518
cmmm55r7m002n89vgll62qk7b	cmmf5un9j004vq3o9fymfcjmb	cmmf5uf15001tq3o9j7pm0zyz	1	2026-03-11 14:35:44.002	2026-03-11 14:35:44.002
cmmm7yrxa001ru3y5gib7zcai	cmmf5ukr6003zq3o910kcqyq3	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-11 15:54:17.182	2026-03-11 15:54:17.182
cmmm7z44c002ru3y58aaldpst	cmmf5unjj004zq3o9aibew2kg	cmmf5ug5b0029q3o9u41fnv34	1	2026-03-11 15:54:32.988	2026-03-11 15:54:32.988
cmmm875zx002fnu8pker5c7ri	cmmf5umpg004nq3o91ic21u41	cmmf5ui8q0031q3o97jervsi0	1	2026-03-11 16:00:48.669	2026-03-11 16:00:48.669
cmmm877ja002jnu8pc3svg4vc	cmmf5umzj004rq3o978xcalgo	cmmf5uer4001pq3o99qn7mt5e	1	2026-03-11 16:00:50.662	2026-03-11 16:00:50.662
cmmm8ohz8002f8563n8lrr6eu	cmmf5umpg004nq3o91ic21u41	cmmf5ufq80023q3o9ys0e1xq5	1	2026-03-11 16:14:17.348	2026-03-11 16:14:17.348
cmmody4fp0027703l2lhdbs9o	cmmf5um5b004fq3o95pxb2ck4	cmmf5ugab002bq3o9n75vkax9	1	2026-03-13 04:17:16.789	2026-03-13 04:17:16.789
cmmodyb07002r703l4r2fbe3r	cmmf5unjj004zq3o9aibew2kg	cmmg2q63v001jcszp3jwjsh8y	1	2026-03-13 04:17:25.303	2026-03-13 04:17:25.303
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, image, "parentId", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmmf5ud7w001bq3o9jagkaqre	Electronics	electronics	Electronics products	\N	\N	t	0	2026-03-06 17:20:29.036	2026-03-06 17:20:29.036
cmmf5udhv001cq3o9fy7wj3ko	Clothing	clothing	Clothing products	\N	\N	t	0	2026-03-06 17:20:29.396	2026-03-06 17:20:29.396
cmmf5udmw001dq3o9l6jicl7j	Books	books	Books products	\N	\N	t	0	2026-03-06 17:20:29.576	2026-03-06 17:20:29.576
cmmf5udry001eq3o98yhixlml	Home & Garden	home-&-garden	Home & Garden products	\N	\N	t	0	2026-03-06 17:20:29.758	2026-03-06 17:20:29.758
cmmf5udwy001fq3o9nnzey79s	Sports	sports	Sports products	\N	\N	t	0	2026-03-06 17:20:29.938	2026-03-06 17:20:29.938
\.


--
-- Data for Name: InventoryLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryLog" (id, "productId", type, quantity, "previousStock", "newStock", reason, reference, "performedBy", "createdAt") FROM stdin;
cmmf74ufh000nxfswmilqe2iy	cmmf5uhjh002rq3o9494ad1nx	SALE	-1	500	499	Order ORD2603060001	cmmf74p6e000ixfsw2u2l0zo9	\N	2026-03-06 17:56:37.518
cmmfba1g0000k1u7ic3zfwths	cmmf5uhoi002tq3o94wxj6miq	SALE	-1	550	549	Order ORD2603060002	cmmfb9w6w000f1u7ivz4udi7w	\N	2026-03-06 19:52:38.353
cmmfd0177000bxwe1zn9d7hkp	cmmf5uhoi002tq3o94wxj6miq	SALE	-1	549	548	Order ORD2603060003	cmmfczwlq0006xwe1nrqzftik	\N	2026-03-06 20:40:50.707
cmmg5ax4g000ivht29274pufi	cmmg2q68j001lcszpdmmi208y	SALE	-2	20	18	Order ORD2603070001	cmmg5arpj000dvht2xd0rtma1	\N	2026-03-07 09:53:07.888
cmmg6meao000egtqtvq54tng1	cmmg2q68j001lcszpdmmi208y	SALE	-2	20	18	Order ORD2603070002	cmmg6m97k0009gtqt83w3s4k8	\N	2026-03-07 10:30:02.977
cmmg7q6oh000e1a3o02fuu16o	cmmg2q63v001jcszp3jwjsh8y	SALE	-2	30	28	Order ORD2603070003	cmmg7q1qi00091a3o9zctiqhx	\N	2026-03-07 11:00:59.345
cmmg8adaw000jg28smxnt1vue	cmmg2q68j001lcszpdmmi208y	SALE	-2	20	18	Order ORD2603070004	cmmg8a8jm000eg28smawe1f4q	\N	2026-03-07 11:16:41.048
cmmhjgsph000ev4u62iprxa0z	cmmg2q63v001jcszp3jwjsh8y	SALE	-1	30	29	Order ORD2603080001	cmmhjgo750009v4u6ra5jmp1c	\N	2026-03-08 09:17:22.901
cmmj974x1000hdemt8l00e8xw	cmmg2q63v001jcszp3jwjsh8y	SALE	-1	30	29	Order ORD2603090001	cmmj96zxz000cdemtcgcwa15g	\N	2026-03-09 14:05:28.357
\.


--
-- Data for Name: ManagerPermissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ManagerPermissions" (id, "userId", "canViewProducts", "canCreateProducts", "canEditProducts", "canDeleteProducts", "canViewOrders", "canUpdateOrderStatus", "canCancelOrders", "canProcessRefunds", "canManageInventory", "canViewAnalytics", "canExportData", "canViewCustomers", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "orderNumber", "userId", "customerEmail", "customerPhone", subtotal, tax, "shippingCost", discount, total, "orderStatus", "paymentStatus", "shippingAddressId", "billingAddressId", "trackingNumber", "customerNotes", "internalNotes", "idempotencyKey", "createdAt", "updatedAt", "gatewayOrderId", "gatewayPaymentId", "paymentMethod", "stockDeducted", "stockDeductedAt", chargeback, chargeback_amount, chargeback_date, is_customer_return, is_manual_review, is_rto, payment_attempts, review_status, rule_score, "shippingPincode") FROM stdin;
cmmf74p6e000ixfsw2u2l0zo9	ORD2603060001	cmmf71xgp0001xfswrrah6w4v	awebsite61@gmail.com		31.00	5.58	0.00	0.00	36.58	CONFIRMED	PAID	cmmf74ck4000dxfswotea5kc7	cmmf74ck4000dxfswotea5kc7	\N	\N	\N	\N	2026-03-06 17:56:30.71	2026-03-06 17:56:37.874	mock_order_1772819794383_5v5x3c	mock_order_1772819794383_5v5x3c	RAZORPAY	t	2026-03-06 17:56:36.091	f	\N	\N	f	f	f	0	\N	15	110096
cmmfb9w6w000f1u7ivz4udi7w	ORD2603060002	cmmfb8gxi00021u7i217bl1xk	pilkhwalbhomik@gmail.com		33.00	5.94	0.00	0.00	38.94	CONFIRMED	PAID	cmmfb9kkw000a1u7i6hx0uqlo	cmmfb9kkw000a1u7i6hx0uqlo	\N	\N	\N	\N	2026-03-06 19:52:31.544	2026-03-06 19:52:38.689	mock_order_1772826755239_7kk727	mock_order_1772826755239_7kk727	RAZORPAY	t	2026-03-06 19:52:37.016	f	\N	\N	f	f	f	0	\N	15	110096
cmmg8a8jm000eg28smawe1f4q	ORD2603070004	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		25998.00	4679.64	0.00	0.00	30677.64	CONFIRMED	PENDING	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-07 11:16:34.882	2026-03-07 11:16:41.404	\N	cod_cmmg8a8jm000eg28smawe1f4q	COD	t	2026-03-07 11:16:39.624	f	\N	\N	f	f	f	0	\N	20	110096
cmmfczwlq0006xwe1nrqzftik	ORD2603060003	cmmf71xgp0001xfswrrah6w4v	awebsite61@gmail.com		33.00	5.94	0.00	0.00	38.94	CONFIRMED	PENDING	cmmf74ck4000dxfswotea5kc7	cmmf74ck4000dxfswotea5kc7	\N	\N	\N	\N	2026-03-06 20:40:44.751	2026-03-06 20:40:51.043	\N	cod_cmmfczwlq0006xwe1nrqzftik	COD	t	2026-03-06 20:40:49.373	f	\N	\N	f	f	f	0	\N	0	110096
cmmg5arpj000dvht2xd0rtma1	ORD2603070001	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		25998.00	4679.64	0.00	0.00	30677.64	CONFIRMED	PAID	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-07 09:53:00.872	2026-03-07 09:53:08.245	mock_order_1772877184714_fmud7c	mock_order_1772877184714_fmud7c	RAZORPAY	t	2026-03-07 09:53:06.458	f	\N	\N	f	f	f	0	\N	35	110096
cmmg6m97k0009gtqt83w3s4k8	ORD2603070002	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		25998.00	4679.64	0.00	0.00	30677.64	CONFIRMED	PAID	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-07 10:29:56.384	2026-03-07 10:30:03.312	mock_order_1772879400008_x7tcj	mock_order_1772879400008_x7tcj	RAZORPAY	t	2026-03-07 10:30:01.643	f	\N	\N	f	f	f	0	\N	20	110096
cmmhjgo750009v4u6ra5jmp1c	ORD2603080001	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		6499.00	1169.82	0.00	0.00	7668.82	CONFIRMED	PENDING	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-08 09:17:17.057	2026-03-08 09:17:23.236	\N	cod_cmmhjgo750009v4u6ra5jmp1c	COD	t	2026-03-08 09:17:21.561	f	\N	\N	f	f	f	0	\N	0	110096
cmmg7q1qi00091a3o9zctiqhx	ORD2603070003	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		12998.00	2339.64	0.00	0.00	15337.64	CONFIRMED	PENDING	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-07 11:00:52.939	2026-03-07 11:00:59.705	\N	cod_cmmg7q1qi00091a3o9zctiqhx	COD	t	2026-03-07 11:00:57.904	f	\N	\N	f	f	f	0	\N	20	110096
cmmj96zxz000cdemtcgcwa15g	ORD2603090001	cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com		6499.00	1169.82	0.00	0.00	7668.82	CONFIRMED	PAID	cmmg5ahnr0008vht2nw1kfgzt	cmmg5ahnr0008vht2nw1kfgzt	\N	\N	\N	\N	2026-03-09 14:05:21.911	2026-03-09 14:05:28.692	mock_order_1773065125374_iuj3qai	mock_order_1773065125374_iuj3qai	RAZORPAY	t	2026-03-09 14:05:27.011	f	\N	\N	f	f	f	0	\N	0	110096
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", "productName", "productImage", quantity, "unitPrice", "totalPrice", "createdAt") FROM stdin;
cmmf74p6e000kxfswuo0eay4g	cmmf74p6e000ixfsw2u2l0zo9	cmmf5uhjh002rq3o9494ad1nx	High Stock Product 9	\N	1	31.00	31.00	2026-03-06 17:56:30.71
cmmfb9w6w000h1u7ilqaxf3ly	cmmfb9w6w000f1u7ivz4udi7w	cmmf5uhoi002tq3o94wxj6miq	High Stock Product 10	\N	1	33.00	33.00	2026-03-06 19:52:31.544
cmmfczwlq0008xwe1qawaxssn	cmmfczwlq0006xwe1nrqzftik	cmmf5uhoi002tq3o94wxj6miq	High Stock Product 10	\N	1	33.00	33.00	2026-03-06 20:40:44.751
cmmg5arpk000fvht20arwnny3	cmmg5arpj000dvht2xd0rtma1	cmmg2q68j001lcszpdmmi208y	Playbox Max Video Box CarPlay Adapter	/images/products/playbox-max/1.png	2	12999.00	25998.00	2026-03-07 09:53:00.872
cmmg6m97k000bgtqtbgxj2lsz	cmmg6m97k0009gtqt83w3s4k8	cmmg2q68j001lcszpdmmi208y	Playbox Max Video Box CarPlay Adapter	/images/products/playbox-max/1.png	2	12999.00	25998.00	2026-03-07 10:29:56.384
cmmg7q1qi000b1a3o6300mqtr	cmmg7q1qi00091a3o9zctiqhx	cmmg2q63v001jcszp3jwjsh8y	Duo Connect B Wireless CarPlay Adapter	/images/products/duo-connect-b/1.png	2	6499.00	12998.00	2026-03-07 11:00:52.939
cmmg8a8jm000gg28syjjhv38k	cmmg8a8jm000eg28smawe1f4q	cmmg2q68j001lcszpdmmi208y	Playbox Max Video Box CarPlay Adapter	/images/products/playbox-max/1.png	2	12999.00	25998.00	2026-03-07 11:16:34.882
cmmhjgo75000bv4u6ur0x780m	cmmhjgo750009v4u6ra5jmp1c	cmmg2q63v001jcszp3jwjsh8y	Duo Connect B Wireless CarPlay Adapter	/images/products/duo-connect-b/1.png	1	6499.00	6499.00	2026-03-08 09:17:17.057
cmmj96zxz000edemtpayyu74i	cmmj96zxz000cdemtcgcwa15g	cmmg2q63v001jcszp3jwjsh8y	Duo Connect B Wireless CarPlay Adapter	/images/products/duo-connect-b/1.png	1	6499.00	6499.00	2026-03-09 14:05:21.911
\.


--
-- Data for Name: OrderSequence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderSequence" (id, date, sequence, "createdAt", "updatedAt") FROM stdin;
cmmf74nnd000fxfsw7x78yufo	260306	3	2026-03-06 17:56:28.73	2026-03-06 20:40:42.249
cmmg5aqbw000avht2huz3h9g9	260307	4	2026-03-07 09:52:59.085	2026-03-07 11:16:32.212
cmmhjgm9f0006v4u69qc89k9l	260308	1	2026-03-08 09:17:14.547	2026-03-08 09:17:14.547
cmmj96ynb0009demt5b6881ja	260309	1	2026-03-09 14:05:20.232	2026-03-09 14:05:20.232
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", gateway, "gatewayOrderId", "gatewayPaymentId", "gatewaySignature", amount, currency, status, method, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, price, "compareAtPrice", sku, stock, "lowStockAlert", "categoryId", images, thumbnail, "isActive", "isFeatured", "metaTitle", "metaDescription", "createdAt", "updatedAt") FROM stdin;
cmmf5ue1y001hq3o9h181vvtr	Low Stock Product 1	low-stock-1	Test product	50.00	\N	\N	5	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:30.119	2026-03-06 17:20:30.119
cmmf5uebz001jq3o9hwr0e0tk	Low Stock Product 2	low-stock-2	Test product	60.00	\N	\N	6	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:30.479	2026-03-06 17:20:30.479
cmmf5ueh0001lq3o97s70dnt4	Low Stock Product 3	low-stock-3	Test product	70.00	\N	\N	7	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:30.661	2026-03-06 17:20:30.661
cmmf5uem3001nq3o9uyt2hgk9	Low Stock Product 4	low-stock-4	Test product	80.00	\N	\N	8	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:30.843	2026-03-06 17:20:30.843
cmmf5uer4001pq3o99qn7mt5e	Low Stock Product 5	low-stock-5	Test product	90.00	\N	\N	9	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.024	2026-03-06 17:20:31.024
cmmf5uew4001rq3o9m1rmsr4n	Medium Stock Product 1	medium-stock-1	Test product	30.00	\N	\N	20	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.204	2026-03-06 17:20:31.204
cmmf5uf15001tq3o9j7pm0zyz	Medium Stock Product 2	medium-stock-2	Test product	35.00	\N	\N	23	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.385	2026-03-06 17:20:31.385
cmmf5uf65001vq3o92wtk1wzj	Medium Stock Product 3	medium-stock-3	Test product	40.00	\N	\N	26	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.565	2026-03-06 17:20:31.565
cmmf5ufb5001xq3o9rkdn8gg1	Medium Stock Product 4	medium-stock-4	Test product	45.00	\N	\N	29	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.746	2026-03-06 17:20:31.746
cmmf5ufg7001zq3o99y927ypv	Medium Stock Product 5	medium-stock-5	Test product	50.00	\N	\N	32	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:31.927	2026-03-06 17:20:31.927
cmmf5ufl70021q3o9tzfwqcor	Medium Stock Product 6	medium-stock-6	Test product	55.00	\N	\N	35	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:32.107	2026-03-06 17:20:32.107
cmmf5ufq80023q3o9ys0e1xq5	Medium Stock Product 7	medium-stock-7	Test product	60.00	\N	\N	38	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:32.288	2026-03-06 17:20:32.288
cmmf5ufv80025q3o9cdtxfcwp	Medium Stock Product 8	medium-stock-8	Test product	65.00	\N	\N	41	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:32.468	2026-03-06 17:20:32.468
cmmf5ug090027q3o9phnv91bn	Medium Stock Product 9	medium-stock-9	Test product	70.00	\N	\N	44	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:32.65	2026-03-06 17:20:32.65
cmmf5ug5b0029q3o9u41fnv34	Medium Stock Product 10	medium-stock-10	Test product	75.00	\N	\N	47	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:32.831	2026-03-06 17:20:32.831
cmmf5ugab002bq3o9n75vkax9	High Stock Product 1	high-stock-1	Test product	15.00	\N	\N	100	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.012	2026-03-06 17:20:33.012
cmmf5ugfc002dq3o936gsedol	High Stock Product 2	high-stock-2	Test product	17.00	\N	\N	150	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.192	2026-03-06 17:20:33.192
cmmf5ugkc002fq3o9gy2rmwqg	High Stock Product 3	high-stock-3	Test product	19.00	\N	\N	200	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.372	2026-03-06 17:20:33.372
cmmf5ugpd002hq3o9m67047db	High Stock Product 4	high-stock-4	Test product	21.00	\N	\N	250	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.553	2026-03-06 17:20:33.553
cmmf5ugud002jq3o9rkh2tzcf	High Stock Product 5	high-stock-5	Test product	23.00	\N	\N	300	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.733	2026-03-06 17:20:33.733
cmmf5ugze002lq3o9qb80h1ol	High Stock Product 6	high-stock-6	Test product	25.00	\N	\N	350	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:33.914	2026-03-06 17:20:33.914
cmmf5uh4g002nq3o9hsyyqatx	High Stock Product 7	high-stock-7	Test product	27.00	\N	\N	400	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:34.096	2026-03-06 17:20:34.096
cmmf5uh9h002pq3o9vz5wq495	High Stock Product 8	high-stock-8	Test product	29.00	\N	\N	450	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:34.278	2026-03-06 17:20:34.278
cmmf5uhtj002vq3o9fb6pwahy	Inactive Product 1	inactive-1	Test product	25.00	\N	\N	50	10	cmmf5ud7w001bq3o9jagkaqre	{https://via.placeholder.com/300}	\N	f	f	\N	\N	2026-03-06 17:20:34.999	2026-03-06 17:20:34.999
cmmf5uhyj002xq3o95hjy6ukk	Inactive Product 2	inactive-2	Test product	25.00	\N	\N	50	10	cmmf5udhv001cq3o9fy7wj3ko	{https://via.placeholder.com/300}	\N	f	f	\N	\N	2026-03-06 17:20:35.179	2026-03-06 17:20:35.179
cmmf5ui3m002zq3o90u6qnq7i	Inactive Product 3	inactive-3	Test product	25.00	\N	\N	50	10	cmmf5udmw001dq3o9l6jicl7j	{https://via.placeholder.com/300}	\N	f	f	\N	\N	2026-03-06 17:20:35.362	2026-03-06 17:20:35.362
cmmf5ui8q0031q3o97jervsi0	Inactive Product 4	inactive-4	Test product	25.00	\N	\N	50	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	f	f	\N	\N	2026-03-06 17:20:35.546	2026-03-06 17:20:35.546
cmmf5uidu0033q3o95zgak4xj	Inactive Product 5	inactive-5	Test product	25.00	\N	\N	50	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	f	f	\N	\N	2026-03-06 17:20:35.73	2026-03-06 17:20:35.73
cmmf5uhjh002rq3o9494ad1nx	High Stock Product 9	high-stock-9	Test product	31.00	\N	\N	499	10	cmmf5udry001eq3o98yhixlml	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:34.458	2026-03-06 17:56:37.162
cmmf5uhoi002tq3o94wxj6miq	High Stock Product 10	high-stock-10	Test product	33.00	\N	\N	548	10	cmmf5udwy001fq3o9nnzey79s	{https://via.placeholder.com/300}	\N	t	f	\N	\N	2026-03-06 17:20:34.818	2026-03-06 20:40:50.375
cmmg2q63v001jcszp3jwjsh8y	Duo Connect B Wireless CarPlay Adapter	duo-connect-b	The classic Duo Connect B offers a slim design and reliable performance. Enjoy high-quality audio and responsive touch controls without the cables.	6499.00	\N	\N	30	10	cmmf5ud7w001bq3o9jagkaqre	{/images/products/duo-connect-b/1.png,/images/products/duo-connect-b/2.png,/images/products/duo-connect-b/3.png,/images/products/duo-connect-b/4.png,/images/products/duo-connect-b/5.png,/images/products/duo-connect-b/6.png,/images/products/duo-connect-b/7.png,/images/products/duo-connect-b/8.png,/images/products/duo-connect-b/9.png,/images/products/duo-connect-b/10.png,/images/products/duo-connect-b/11.png,/images/products/duo-connect-b/12.png}	/images/products/duo-connect-b/1.png	t	t	\N	\N	2026-03-07 08:41:00.523	2026-03-13 04:17:04.599
cmmg2q68j001lcszpdmmi208y	Playbox Max Video Box CarPlay Adapter	playbox-max	Transform your car screen into a powerful android tablet. Watch YouTube, Netflix, and more on your car display. Supports wireless CarPlay and Android Auto.	12999.00	\N	\N	20	10	cmmf5ud7w001bq3o9jagkaqre	{/images/products/playbox-max/1.png}	/images/products/playbox-max/1.png	t	t	\N	\N	2026-03-07 08:41:00.691	2026-03-13 04:17:04.77
cmmg2q6d8001ncszpxykxkm3z	Y2 CarPlay Adapter	y2-adapter	Compact and efficient, the Y2 adapter is the perfect entry-level solution for wireless CarPlay. Mini size, hidden design, and high performance.	5499.00	\N	\N	50	10	cmmf5ud7w001bq3o9jagkaqre	{/images/products/y2-adapter/1.png}	/images/products/y2-adapter/1.png	t	t	\N	\N	2026-03-07 08:41:00.859	2026-03-13 04:17:04.938
cmmg2q5ul001hcszpejuij315	Duo ConnectX Wireless CarPlay Adapter	duo-connectx	Upgrade your car to wireless CarPlay with the Duo ConnectX. Fast stable connection, automatic pairing, and zero latency. Compatible with all factory CarPlay cars.	7999.00	\N	\N	45	10	cmmf5ud7w001bq3o9jagkaqre	{/images/products/duo-connectx/1.png,/images/products/duo-connectx/2.png,/images/products/duo-connectx/3.png,/images/products/duo-connectx/4.png,/images/products/duo-connectx/5.png,/images/products/duo-connectx/6.png,/images/products/duo-connectx/7.png,/images/products/duo-connectx/8.png,/images/products/duo-connectx/9.png}	/images/products/duo-connectx/1.png	t	t	\N	\N	2026-03-07 08:41:00.189	2026-03-13 04:17:04.262
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImage" (id, url, "publicId", "isPrimary", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
cmmf5vho50001miq4lwiqliu2	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODE3NjgxLCJleHAiOjE3NzM0MjI0ODF9.zEwmqxTLBK0Szid1yo_GQECEhc1cPhnCDBIrVJXmBkw	2026-03-13 17:21:21.46	2026-03-06 17:21:21.462
cmmf72eq30003xfsw79fb4pv7	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgxOTY4MywiZXhwIjoxNzczNDI0NDgzfQ.HJQUymwiIuFyc9An2-pQ7C6GvUbR_7TPzvKeeXjw_So	2026-03-13 17:54:43.85	2026-03-06 17:54:43.852
cmmf72zc60007xfswgara17fk	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODE5NzEwLCJleHAiOjE3NzM0MjQ1MTB9.jw01f1t8OgQb604jm5mb0uRjoOYoFB32qNwQG-XbQyk	2026-03-13 17:55:10.566	2026-03-06 17:55:10.567
cmmf73wse0009xfswjmzz4naw	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgxOTc1MywiZXhwIjoxNzczNDI0NTUzfQ.NsR8KmekaIsCdp_d8hL1R1S-vSqKWfh61oY3hOqmP90	2026-03-13 17:55:53.917	2026-03-06 17:55:53.918
cmmfb6whn00011u7izfuwoav9	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgyNjYxMSwiZXhwIjoxNzczNDMxNDExfQ.Z57dwuMv-cNjFLo9JbrW7ik4bm-Gg6t_ZQ3ZbtXvXHs	2026-03-13 19:50:11.962	2026-03-06 19:50:11.963
cmmfb8olb00041u7ije2otulc	cmmfb8gxi00021u7i217bl1xk	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mYjhneGkwMDAyMXU3aTIxN2JsMXhrIiwiZW1haWwiOiJwaWxraHdhbGJob21pa0BnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4MjY2OTUsImV4cCI6MTc3MzQzMTQ5NX0.5vhL5Rwgd449xE-unsEy9uwCp18OroD0z8WBnuc8WSo	2026-03-13 19:51:35.038	2026-03-06 19:51:35.039
cmmfbzy330001hfewts786873	cmmfb8gxi00021u7i217bl1xk	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mYjhneGkwMDAyMXU3aTIxN2JsMXhrIiwiZW1haWwiOiJwaWxraHdhbGJob21pa0BnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4Mjc5NjcsImV4cCI6MTc3MzQzMjc2N30.sziuxhgdgZb11gS3xMYEz6DDHKsESqhfwvrtW-IE9BA	2026-03-13 20:12:47.054	2026-03-06 20:12:47.055
cmmfc3c8j0009hfew0d748mci	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgyODEyNSwiZXhwIjoxNzczNDMyOTI1fQ.uB2zoYY_H5047SkP1TX4PolWn15a9tgPk-JYnLRGGeo	2026-03-13 20:15:25.363	2026-03-06 20:15:25.363
cmmfc55jt000bhfewb7swkyuu	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODI4MjEwLCJleHAiOjE3NzM0MzMwMTB9.8xX2IEyx1KL13s4BFscL2sOcNlrFjGfQW_HE55D22Ws	2026-03-13 20:16:50.008	2026-03-06 20:16:50.009
cmmfcze5i0001xwe1t31m4flp	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgyOTYyMCwiZXhwIjoxNzczNDM0NDIwfQ.N9bfcnEEbceDx2suZkpm2iDVqlRLNz-MBFwsm1GGfb0	2026-03-13 20:40:20.837	2026-03-06 20:40:20.838
cmmfd1d1o000dxwe1d4l7uk4b	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODI5NzEyLCJleHAiOjE3NzM0MzQ1MTJ9.9HUbN3eyA7ItSXLcsPZ5lppgpHRE2saGfuRBVC_K_W8	2026-03-13 20:41:52.715	2026-03-06 20:41:52.716
cmmfdzylp0001ccxn5hu6pyoo	cmmf71xgp0001xfswrrah6w4v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNzF4Z3AwMDAxeGZzd3JyYWg2dzR2IiwiZW1haWwiOiJhd2Vic2l0ZTYxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc3MjgzMTMyNiwiZXhwIjoxNzczNDM2MTI2fQ.XV1VjpATSAvUARziqYzKuhegk5CXHNIbQPbNgiLcXa8	2026-03-13 21:08:46.956	2026-03-06 21:08:46.957
cmmfxwpqj0005ccxnclv5tyjb	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODY0NzY3LCJleHAiOjE3NzM0Njk1Njd9.yqj-TcilAbV8qnL2Rjj-tSNSc8OF_7JyU3RT4-nAMrI	2026-03-14 06:26:07.818	2026-03-07 06:26:07.819
cmmg3d5k200018ekx2va8a7e8	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODczOTMyLCJleHAiOjE3NzM0Nzg3MzJ9.v7zZu1AH6kqJrhMbtiIaHscJEKHeqRCnUCqBywNE4Tg	2026-03-14 08:58:52.897	2026-03-07 08:58:52.898
cmmg3gsei00048ekxddddlyyd	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4NzQxMDIsImV4cCI6MTc3MzQ3ODkwMn0.9sVqMyv8r2ey8kgizI0BPYAszNlWOeTQz_656I3vTQQ	2026-03-14 09:01:42.473	2026-03-07 09:01:42.474
cmmg55dc00001vht2thiatpi7	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4NzY5MjgsImV4cCI6MTc3MzQ4MTcyOH0.1D6mQCWdu9Nmsrq9jye0KJ8i8CGj97gPjBNalOcr9Sc	2026-03-14 09:48:48.959	2026-03-07 09:48:48.96
cmmg56d8z0003vht2d0ucbk3h	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODc2OTc1LCJleHAiOjE3NzM0ODE3NzV9.qRcQY0ST649cORuW8T0D6X-rhOMWQle8D_stKQo4B0A	2026-03-14 09:49:35.506	2026-03-07 09:49:35.507
cmmg58t690005vht2jyjbel1n	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4NzcwODksImV4cCI6MTc3MzQ4MTg4OX0.Fgv70OiEYvMww7hmpgzNCkUZvsHwEhnOg-5YL3Gj-F0	2026-03-14 09:51:29.457	2026-03-07 09:51:29.458
cmmg591940007vht24yhgydm2	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4NzcwOTksImV4cCI6MTc3MzQ4MTg5OX0.Tnw3X1R4_rh8UxDoVi3FIQ3_8xFfZeHpo2t9YY2YW4Y	2026-03-14 09:51:39.928	2026-03-07 09:51:39.928
cmmg6liq80001gtqts2jn7di6	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4NzkzNjIsImV4cCI6MTc3MzQ4NDE2Mn0.RpRXkYo4jHDNeoYe1HaG9SzHd0_ALgLXoDb4nn-7y5U	2026-03-14 10:29:22.063	2026-03-07 10:29:22.064
cmmg71zvb000ggtqt0o9lp0xb	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODgwMTMwLCJleHAiOjE3NzM0ODQ5MzB9.qzUStsr9iw3wJpWQDXlYM41ZiQE0yIGjjcc-mcws5_A	2026-03-14 10:42:10.774	2026-03-07 10:42:10.775
cmmg7o7jm00011a3oa0dfb6yt	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4ODExNjcsImV4cCI6MTc3MzQ4NTk2N30.QRWiZ1lg5bPOPqSc3l9snxHpwarWkSTFf6D4WVYwYcY	2026-03-14 10:59:27.153	2026-03-07 10:59:27.154
cmmg7sblg000g1a3o6lnwit84	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODgxMzU5LCJleHAiOjE3NzM0ODYxNTl9.WHmT7cOmIVsfNTK60i4FewsC98m_cEbDF2hoZKIBbyc	2026-03-14 11:02:39.027	2026-03-07 11:02:39.028
cmmg86dbd0001g28sbrqm2sxf	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODgyMDE0LCJleHAiOjE3NzM0ODY4MTR9.hRJOQALCp2OPRdK-1aHW76yb_JCxGFEbG1yjcjjt28A	2026-03-14 11:13:34.44	2026-03-07 11:13:34.441
cmmg89gn50003g28ssza21gqz	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI4ODIxNTgsImV4cCI6MTc3MzQ4Njk1OH0.21bl67iFHi_TQ1ZFQymzG8PACnPD1jyLVVRzWJAQ_Dk	2026-03-14 11:15:58.721	2026-03-07 11:15:58.722
cmmhd06370001z0q55zk9tudt	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI5NTA1ODksImV4cCI6MTc3MzU1NTM4OX0.th6iLQcO3RBku_1jxOE47UFBJbSDJdnb9PXGtyBaAA0	2026-03-15 06:16:29.394	2026-03-08 06:16:29.395
cmmhjfk2r0001v4u6m1cpai09	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI5NjEzODUsImV4cCI6MTc3MzU2NjE4NX0.7c16n6i2gStjGz7cDN82YpPUuR4RU4MRZEfi59nsBMY	2026-03-15 09:16:25.058	2026-03-08 09:16:25.06
cmmhjkljy000gv4u6c01rpadc	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyOTYxNjIwLCJleHAiOjE3NzM1NjY0MjB9.3yvq0knDudlP_CKWOv7Lma5zX581Lz6f4uoPRU21utA	2026-03-15 09:20:20.252	2026-03-08 09:20:20.254
cmmiv6x4c0003jc802otfdaip	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczMDQxNjAzLCJleHAiOjE3NzM2NDY0MDN9.b6o65vjRoa-2B4yAZGK62ibTrvWboC68QRF5_vBqiQY	2026-03-16 07:33:23.628	2026-03-09 07:33:23.629
cmmiv70a60005jc80i7glb4mm	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczMDQxNjA3LCJleHAiOjE3NzM2NDY0MDd9.5aevd6hsCKZvFiVnUIb3PXCrOwUttuKkIzoU8q7vL9g	2026-03-16 07:33:27.724	2026-03-09 07:33:27.726
cmmj8wk690001demtynto50m0	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczMDY0NjM0LCJleHAiOjE3NzM2Njk0MzR9.3Q_aTEQ5NY6R8Te-_HSXHpoewExdWGqDENujFLSS9hc	2026-03-16 13:57:14.912	2026-03-09 13:57:14.913
cmmj93yrq0004demtk0sqjjvl	cmmg3gni200028ekxddxl6g2g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1nM2duaTIwMDAyOGVreGRkeGw2ZzJnIiwiZW1haWwiOiJhd2Vic2l0ZTYwMUBnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzMwNjQ5ODAsImV4cCI6MTc3MzY2OTc4MH0.syUyM9MKk8iwRQzVQZ9QTDy75VMP3-kBHkMEN2SR-VM	2026-03-16 14:03:00.421	2026-03-09 14:03:00.422
cmmkp1lah000ldemt6xym544q	cmmf5tv2b000qq3o9l7p2v3jr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1mNXR2MmIwMDBxcTNvOWw3cDJ2M2pyIiwiZW1haWwiOiJhZG1pbkBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczMTUyMjA5LCJleHAiOjE3NzM3NTcwMDl9.u8IpMvGYc0-IibTSI7xwsaagpJcr-XjEnCyQQkYnfdw	2026-03-17 14:16:49.672	2026-03-10 14:16:49.673
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, phone, role, "isActive", "emailVerified", "createdAt", "updatedAt", "roleId") FROM stdin;
cmmf5txac000sq3o9hbfmz1sb	customer2@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 2	+1-555-0102	CUSTOMER	t	t	2026-03-06 17:20:08.388	2026-03-13 04:16:43.587	cmmf5tiqz000pq3o933nzbyvb
cmmf5ty48000tq3o9waorxsof	customer3@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 3	+1-555-0103	CUSTOMER	t	t	2026-03-06 17:20:09.465	2026-03-13 04:16:44.428	cmmf5tiqz000pq3o933nzbyvb
cmmfb8gxi00021u7i217bl1xk	pilkhwalbhomik@gmail.com	$2a$10$FiLRlOOv7xQgFitobZL4fuBvrleLHqORNjT7/ON66axZ.R1oQfyXq	bhomik pilkhwal	\N	CUSTOMER	t	f	2026-03-06 19:51:25.11	2026-03-06 19:51:25.11	cmmf5tiqz000pq3o933nzbyvb
cmmf5u33t000zq3o96nn7do64	customer9@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 9	+1-555-0109	CUSTOMER	t	t	2026-03-06 17:20:15.929	2026-03-13 04:16:49.426	cmmf5tiqz000pq3o933nzbyvb
cmmf5u3xp0010q3o93s59an8h	customer10@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 10	+1-555-0110	CUSTOMER	t	t	2026-03-06 17:20:17.005	2026-03-13 04:16:50.259	cmmf5tiqz000pq3o933nzbyvb
cmmf5u9wd0017q3o9edeawt70	customer17@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 17	+1-555-0117	CUSTOMER	t	t	2026-03-06 17:20:24.733	2026-03-13 04:16:56.082	cmmf5tiqz000pq3o933nzbyvb
cmmf5u4rm0011q3o97qrg91db	customer11@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 11	+1-555-0111	CUSTOMER	t	t	2026-03-06 17:20:18.082	2026-03-13 04:16:51.092	cmmf5tiqz000pq3o933nzbyvb
cmmf712ig0000xfswcm4ex8pj	awebsite607@gmail.com	$2a$10$VyHik/TFtbDgGMetYjvIdOXVYALDqYT9.CYGefrJ0BJgEBaHG8RIq	Bhomik Pilkhwal	\N	CUSTOMER	t	f	2026-03-06 17:53:41.368	2026-03-06 17:53:41.368	cmmf5tiqz000pq3o933nzbyvb
cmmf71xgp0001xfswrrah6w4v	awebsite61@gmail.com	$2a$10$6PoyKxbK9PPmy0lG8qK1g.55a8tym79TAAm7qXlohrqaYbyMpcnWO	Bhomik Pilkhwal	\N	CUSTOMER	t	f	2026-03-06 17:54:21.481	2026-03-06 17:54:21.481	cmmf5tiqz000pq3o933nzbyvb
cmmf5u5qh0012q3o9hhzfcadp	customer12@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 12	+1-555-0112	CUSTOMER	t	t	2026-03-06 17:20:19.158	2026-03-13 04:16:51.922	cmmf5tiqz000pq3o933nzbyvb
cmmf5u6kp0013q3o9gm792n14	customer13@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 13	+1-555-0113	CUSTOMER	t	t	2026-03-06 17:20:20.425	2026-03-13 04:16:52.754	cmmf5tiqz000pq3o933nzbyvb
cmmf5u7em0014q3o9touz3mf3	customer14@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 14	+1-555-0114	CUSTOMER	t	t	2026-03-06 17:20:21.502	2026-03-13 04:16:53.589	cmmf5tiqz000pq3o933nzbyvb
cmmf5uaq80018q3o9yu5iiv7s	customer18@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 18	+1-555-0118	CUSTOMER	t	t	2026-03-06 17:20:25.809	2026-03-13 04:16:57.081	cmmf5tiqz000pq3o933nzbyvb
cmmf5ubk40019q3o9ycdch176	customer19@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 19	+1-555-0119	CUSTOMER	t	t	2026-03-06 17:20:26.885	2026-03-13 04:16:57.913	cmmf5tiqz000pq3o933nzbyvb
cmmf5uce0001aq3o9iiha8mfz	customer20@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 20	+1-555-0120	CUSTOMER	t	t	2026-03-06 17:20:27.961	2026-03-13 04:16:58.75	cmmf5tiqz000pq3o933nzbyvb
cmmf5tv2b000qq3o9l7p2v3jr	admin@ecommerce.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Admin User	+1-555-0001	ADMIN	t	t	2026-03-06 17:20:05.507	2026-03-13 04:16:41.415	cmmf5tcn7000hq3o9saltstp9
cmmf5tyy3000uq3o91smcysv8	customer4@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 4	+1-555-0104	CUSTOMER	t	t	2026-03-06 17:20:10.54	2026-03-13 04:16:45.26	cmmf5tiqz000pq3o933nzbyvb
cmmf5tzs2000vq3o9hn3rs3nx	customer5@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 5	+1-555-0105	CUSTOMER	t	t	2026-03-06 17:20:11.619	2026-03-13 04:16:46.093	cmmf5tiqz000pq3o933nzbyvb
cmmf5u0m1000wq3o96iifh2ce	customer6@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 6	+1-555-0106	CUSTOMER	t	t	2026-03-06 17:20:12.697	2026-03-13 04:16:46.925	cmmf5tiqz000pq3o933nzbyvb
cmmf5u1fx000xq3o9j8zt36bq	customer7@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 7	+1-555-0107	CUSTOMER	t	t	2026-03-06 17:20:13.774	2026-03-13 04:16:47.757	cmmf5tiqz000pq3o933nzbyvb
cmmg3gni200028ekxddxl6g2g	awebsite601@gmail.com	$2a$10$jLGf0gPPGLzqeqyhw.K/juGSYdra7t3bfEXRB3ELcHjd59TQpdF.6	Bhomik Pilkhwal	\N	CUSTOMER	t	f	2026-03-07 09:01:36.122	2026-03-07 09:01:36.122	cmmf5tiqz000pq3o933nzbyvb
cmmf5twgb000rq3o9s0mo6j9b	customer1@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 1	+1-555-0101	CUSTOMER	t	t	2026-03-06 17:20:07.307	2026-03-13 04:16:42.749	cmmf5tiqz000pq3o933nzbyvb
cmmf5u29v000yq3o9z2n9rjgt	customer8@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 8	+1-555-0108	CUSTOMER	t	t	2026-03-06 17:20:14.851	2026-03-13 04:16:48.595	cmmf5tiqz000pq3o933nzbyvb
cmmf5u88j0015q3o9ko5j8fd8	customer15@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 15	+1-555-0115	CUSTOMER	t	t	2026-03-06 17:20:22.579	2026-03-13 04:16:54.421	cmmf5tiqz000pq3o933nzbyvb
cmmf5u92f0016q3o9tduc9e0q	customer16@gmail.com	$2a$10$rVntgrf5yX1pwhvGeVpOR.aCxJwelDUkoxEncTOuQZkFVMRwp8uTy	Customer 16	+1-555-0116	CUSTOMER	t	t	2026-03-06 17:20:23.656	2026-03-13 04:16:55.251	cmmf5tiqz000pq3o933nzbyvb
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0170265e-cff5-4b9d-9058-1b231ec4886d	39e7a5e3441dbb7c3bbbe160b9cfa365a12b3fed6ec2020bcda3eac66f063497	2026-03-06 10:32:22.308703+00	20260215163723_phase4_5_transaction_hardening	\N	\N	2026-03-06 10:32:21.263576+00	1
9d9ecde5-2ee7-4943-9bc8-2a309da8e33e	e57b623667d6092131aa7732bf2c59c06e38bcad92f008f6b2f69928a368abad	2026-03-06 10:32:23.479897+00	20260216055827_add_payment_gateway_fields	\N	\N	2026-03-06 10:32:22.642806+00	1
c77e31f1-9c40-4ca5-b986-814b76b161f9	f49197bc593d18c1a75e099eda8ce91c71cf980f2239d682a875cc877a840bca	2026-03-06 16:49:36.983265+00	20260306164138_add_system_config	\N	\N	2026-03-06 16:49:36.146209+00	1
5300b487-0977-42bc-abbb-124d2f721508	5cd61ee72209554e492cb447b4f8f0666433449b06450b9a8ed93e488b830de3	2026-03-06 10:32:24.646867+00	20260216140714_add_stock_deduction_tracking	\N	\N	2026-03-06 10:32:23.811022+00	1
80ec6367-8f86-4252-bfeb-dcc05686758a	ea3aed1e9be49c4dce4f2fecdfc6b169efece7c3c918d04038d03dfc3a0da410	2026-03-06 10:32:25.812385+00	20260218085800_add_product_images	\N	\N	2026-03-06 10:32:24.978335+00	1
fcd99a4d-c541-4941-8607-57da4e61c0c0	753981e483a4538eace2b50151a3d795217a4ce1dc40cbd308c426716e71fb46	2026-03-06 10:32:26.980015+00	20260219080323_rename_role_enum	\N	\N	2026-03-06 10:32:26.144814+00	1
bea58f11-bada-4c37-91b3-cbb3790712e7	995ebcb8a0374b50d3fb05eb24aaa3c0c13fd41d31f58d2bcd897dbd2866440b	2026-03-06 17:19:28.742399+00	20260306171250_remove_enforcement_mode_enum	\N	\N	2026-03-06 17:19:27.841128+00	1
e7607371-546e-4e14-aefc-d649a5ba2602	87121f8c7f4f5b8971a368df6e6aa100a8af6448324aa4d79a0677c69c3c7f91	2026-03-06 10:32:28.156759+00	20260219080442_init_rbac	\N	\N	2026-03-06 10:32:27.314271+00	1
3a0c5ebf-5431-4c0a-8b19-b4e33d35b2e8	8de82322793126d2656d88f74dfb33bd3fc074730b3ffec4fabd3cedde7c99c4	2026-03-06 10:32:29.339248+00	20260219081223_enforce_role_id	\N	\N	2026-03-06 10:32:28.489356+00	1
b55e70c1-f74c-4b17-8c6f-52ed90b6f52b	fd135a6aa65faed376f25ef0aa479efca268435ea9b4349e324fc7f64d0a2ba7	2026-03-06 10:32:30.507+00	20260219120915_init_risk_engine	\N	\N	2026-03-06 10:32:29.671391+00	1
5e366f33-6139-4fee-8a02-855852a3f85d	e3355f2d7b385be3c4ba614fb8c62895d694cb93fdedd3230fd68bdc8c6d2381	2026-03-06 10:32:31.676363+00	20260225130336_phase8_order_risk_engine_extension	\N	\N	2026-03-06 10:32:30.841133+00	1
c977d2c2-2d1a-4fe4-b8fc-6700f4e25ef1	4c579f8e397f5dcda2b8c970ff6ed4f7507abc8e29d967d6cab1e2c3a8fa5f05	2026-03-06 10:32:32.849529+00	20260225131521_phase8b_pincode_risk_last_evaluated_at	\N	\N	2026-03-06 10:32:32.011124+00	1
955732cb-370e-49c0-988c-bdb4f005bf45	ce192e9cafd638c7b3146865adfb74b101af183e0b2f6efdc2421aa4b47da937	2026-03-06 10:32:34.017593+00	20260225164458_init_alerts	\N	\N	2026-03-06 10:32:33.181057+00	1
f8656e24-41d8-40f5-86c8-4e742fbca246	82fa12b476b7001f3b84ff1c966ed8835bf47e77a3079c35f74f18396d0077c2	2026-03-06 10:32:35.181317+00	20260226133315_phase_9b_index_audit	\N	\N	2026-03-06 10:32:34.34909+00	1
edce4462-6bf7-4197-9619-744922b38846	0088dda940dc96a34f69fa42b18576a3be749e45d5e0d56b79eabbf74bff6148	2026-03-06 10:32:36.345918+00	20260226134422_phase_9c_metrics_snapshot	\N	\N	2026-03-06 10:32:35.514804+00	1
\.


--
-- Data for Name: metrics_snapshot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metrics_snapshot (id, date, "mtdGMV", "ordersCount", "prepaidCount", "prepaidPercentage", "rtoRate", "chargebackRate", "avgShippingCost", "manualReviewPending", "createdAt") FROM stdin;
4fa6f133-3515-443c-b4dd-c007f36d27b1	2026-03-07	114.46	3	2	66.67	0.00	0.00	0.00	0	2026-03-07 02:00:04.905
6b679c5d-39a8-4ce8-9cd6-d347c959ab00	2026-03-08	107485.02	7	4	57.14	0.00	0.00	0.00	0	2026-03-08 02:00:06.526
8865a876-6e2f-4429-85df-8a7e839c59bd	2026-03-09	115153.84	8	4	50.00	0.00	0.00	0.00	0	2026-03-09 02:00:05.342
87f2295b-af59-44ca-a82f-d17bdd715b4d	2026-03-10	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-10 02:00:04.932
38d662af-5d3b-41e1-86a5-e5e5f9894148	2026-03-11	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-11 02:00:04.86
3346baa7-c792-4d4e-8bc8-6fc8641b6734	2026-03-12	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-12 02:00:05.054
ab327b02-2118-4d0a-9d1c-41901c4f094b	2026-03-13	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-13 02:00:05.164
cbfe75e8-2e2c-4486-904c-13bdb2d5d832	2026-03-14	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-14 02:00:05.028
e8c555d9-339f-4722-868f-19d4527f2947	2026-03-15	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-15 02:00:05.095
a1c76644-5da4-484f-a309-b2b4a6614606	2026-03-16	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-16 02:00:04.996
16a60e16-c813-45c5-9678-58d3bce211f1	2026-03-17	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-17 02:00:04.822
186fc048-924b-4438-9d09-6724840aef33	2026-03-18	122822.66	9	5	55.56	0.00	0.00	0.00	0	2026-03-18 02:00:05.003
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, key, description, "createdAt", "updatedAt") FROM stdin;
cmmf5ta4v0000q3o9qemqtt5a	product.create	Permission for product.create	2026-03-06 17:19:38.384	2026-03-06 17:19:38.384
cmmf5taex0001q3o9s9jxyzex	product.update	Permission for product.update	2026-03-06 17:19:38.745	2026-03-06 17:19:38.745
cmmf5tajx0002q3o93qmxdgff	product.delete	Permission for product.delete	2026-03-06 17:19:38.925	2026-03-06 17:19:38.925
cmmf5tap10003q3o97mo66b5j	price.change.request	Permission for price.change.request	2026-03-06 17:19:39.109	2026-03-06 17:19:39.109
cmmf5tau10004q3o9l70oyan6	price.change.approve.manager	Permission for price.change.approve.manager	2026-03-06 17:19:39.289	2026-03-06 17:19:39.289
cmmf5taz30005q3o96z12m5am	price.change.approve.admin	Permission for price.change.approve.admin	2026-03-06 17:19:39.471	2026-03-06 17:19:39.471
cmmf5tb440006q3o9x4h340h5	refund.initiate	Permission for refund.initiate	2026-03-06 17:19:39.653	2026-03-06 17:19:39.653
cmmf5tb940007q3o9n8t3u3gw	refund.approve.manager	Permission for refund.approve.manager	2026-03-06 17:19:39.833	2026-03-06 17:19:39.833
cmmf5tbe60008q3o9dw4a9hcf	refund.approve.finance	Permission for refund.approve.finance	2026-03-06 17:19:40.015	2026-03-06 17:19:40.015
cmmf5tbj60009q3o9len37oll	user.manage	Permission for user.manage	2026-03-06 17:19:40.195	2026-03-06 17:19:40.195
cmmf5tbo6000aq3o9tk7ulalw	audit.view	Permission for audit.view	2026-03-06 17:19:40.375	2026-03-06 17:19:40.375
cmmf5tbt6000bq3o9fxzkvoun	analytics.view	Permission for analytics.view	2026-03-06 17:19:40.555	2026-03-06 17:19:40.555
cmmf5tby6000cq3o974qzgepr	export.bulk	Permission for export.bulk	2026-03-06 17:19:40.735	2026-03-06 17:19:40.735
cmmf5tc36000dq3o9b3bzc2qr	fraud.view	Permission for fraud.view	2026-03-06 17:19:40.915	2026-03-06 17:19:40.915
cmmf5tc87000eq3o9q463q7cv	fraud.config.update	Permission for fraud.config.update	2026-03-06 17:19:41.096	2026-03-06 17:19:41.096
cmmf5tcd7000fq3o9hzama04d	rbac.manage	Permission for rbac.manage	2026-03-06 17:19:41.275	2026-03-06 17:19:41.275
cmmf5tci7000gq3o9ucjnivcs	SYSTEM_CONFIG_EDIT	Permission for SYSTEM_CONFIG_EDIT	2026-03-06 17:19:41.455	2026-03-06 17:19:41.455
\.


--
-- Data for Name: pincode_risk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pincode_risk (pincode, "totalOrders30d", "rtoCount30d", "rtoPercentage", "riskLevel", "lastUpdated", "lastEvaluatedAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId", "assignedAt", "assignedBy") FROM stdin;
cmmf5tcn7000hq3o9saltstp9	cmmf5ta4v0000q3o9qemqtt5a	2026-03-06 17:19:50.803	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5taex0001q3o9s9jxyzex	2026-03-06 17:19:51.343	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tajx0002q3o93qmxdgff	2026-03-06 17:19:51.703	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tap10003q3o97mo66b5j	2026-03-06 17:19:52.065	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tau10004q3o9l70oyan6	2026-03-06 17:19:52.426	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5taz30005q3o96z12m5am	2026-03-06 17:19:52.785	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tb440006q3o9x4h340h5	2026-03-06 17:19:53.145	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tb940007q3o9n8t3u3gw	2026-03-06 17:19:53.504	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tbe60008q3o9dw4a9hcf	2026-03-06 17:19:53.865	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tbj60009q3o9len37oll	2026-03-06 17:19:54.226	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tbo6000aq3o9tk7ulalw	2026-03-06 17:19:54.586	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tbt6000bq3o9fxzkvoun	2026-03-06 17:19:54.946	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tby6000cq3o974qzgepr	2026-03-06 17:19:55.305	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tc36000dq3o9b3bzc2qr	2026-03-06 17:19:55.67	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tc87000eq3o9q463q7cv	2026-03-06 17:19:56.029	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tcd7000fq3o9hzama04d	2026-03-06 17:19:56.39	SEED
cmmf5tcn7000hq3o9saltstp9	cmmf5tci7000gq3o9ucjnivcs	2026-03-06 17:19:56.75	SEED
cmmf5teg8000jq3o962xn2znm	cmmf5ta4v0000q3o9qemqtt5a	2026-03-06 17:19:59.999	SEED
cmmf5teg8000jq3o962xn2znm	cmmf5taex0001q3o9s9jxyzex	2026-03-06 17:20:00.362	SEED
cmmf5teg8000jq3o962xn2znm	cmmf5tap10003q3o97mo66b5j	2026-03-06 17:20:00.722	SEED
cmmf5tf54000kq3o9z8p05ypc	cmmf5taex0001q3o9s9jxyzex	2026-03-06 17:20:01.082	SEED
cmmf5tf54000kq3o9z8p05ypc	cmmf5tby6000cq3o974qzgepr	2026-03-06 17:20:01.441	SEED
cmmf5tfu4000lq3o9vz1js8fg	cmmf5tbj60009q3o9len37oll	2026-03-06 17:20:01.802	SEED
cmmf5tfu4000lq3o9vz1js8fg	cmmf5tb440006q3o9x4h340h5	2026-03-06 17:20:02.163	SEED
cmmf5tgja000mq3o9669zg2i9	cmmf5tbe60008q3o9dw4a9hcf	2026-03-06 17:20:02.523	SEED
cmmf5tgja000mq3o9669zg2i9	cmmf5tbt6000bq3o9fxzkvoun	2026-03-06 17:20:02.883	SEED
cmmf5tgja000mq3o9669zg2i9	cmmf5tby6000cq3o974qzgepr	2026-03-06 17:20:03.243	SEED
cmmf5th86000nq3o92qracs6f	cmmf5tbt6000bq3o9fxzkvoun	2026-03-06 17:20:03.605	SEED
cmmf5th86000nq3o92qracs6f	cmmf5tby6000cq3o974qzgepr	2026-03-06 17:20:04.144	SEED
cmmf5th86000nq3o92qracs6f	cmmf5tbo6000aq3o9tk7ulalw	2026-03-06 17:20:04.506	SEED
cmmf5ti21000oq3o9l5ewxq59	cmmf5tbo6000aq3o9tk7ulalw	2026-03-06 17:20:04.866	SEED
cmmf5ti21000oq3o9l5ewxq59	cmmf5tbt6000bq3o9fxzkvoun	2026-03-06 17:20:05.229	SEED
cmmf5tdrd000iq3o9k06e35v9	cmmf5ta4v0000q3o9qemqtt5a	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5taex0001q3o9s9jxyzex	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tau10004q3o9l70oyan6	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tb940007q3o9n8t3u3gw	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tbj60009q3o9len37oll	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tbt6000bq3o9fxzkvoun	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tby6000cq3o974qzgepr	2026-03-09 13:58:42.429	\N
cmmf5tdrd000iq3o9k06e35v9	cmmf5tajx0002q3o93qmxdgff	2026-03-11 14:20:46.985	SEED
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
cmmf5tcn7000hq3o9saltstp9	ADMIN	Role ADMIN	2026-03-06 17:19:41.635	2026-03-06 17:19:41.635
cmmf5tdrd000iq3o9k06e35v9	MANAGER	Role MANAGER	2026-03-06 17:19:43.081	2026-03-06 17:19:43.081
cmmf5teg8000jq3o962xn2znm	Product Manager	Role Product Manager	2026-03-06 17:19:43.977	2026-03-06 17:19:43.977
cmmf5tf54000kq3o9z8p05ypc	Inventory Manager	Role Inventory Manager	2026-03-06 17:19:44.873	2026-03-06 17:19:44.873
cmmf5tfu4000lq3o9vz1js8fg	Support	Role Support	2026-03-06 17:19:45.772	2026-03-06 17:19:45.772
cmmf5tgja000mq3o9669zg2i9	Finance	Role Finance	2026-03-06 17:19:46.678	2026-03-06 17:19:46.678
cmmf5th86000nq3o92qracs6f	Analyst	Role Analyst	2026-03-06 17:19:47.574	2026-03-06 17:19:47.574
cmmf5ti21000oq3o9l5ewxq59	Developer	Role Developer	2026-03-06 17:19:48.471	2026-03-06 17:19:48.471
cmmf5tiqz000pq3o933nzbyvb	CUSTOMER	Role CUSTOMER	2026-03-06 17:19:49.547	2026-03-06 17:19:49.547
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (id, "maxLoginAttempts", "fraudRiskThreshold", "enableEmailVerification", "createdAt", "updatedAt") FROM stdin;
DEFAULT_CONFIG	10	80	t	2026-03-06 16:50:47.533	2026-03-08 09:21:08.073
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: Alert Alert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT "Alert_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLog InventoryLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_pkey" PRIMARY KEY (id);


--
-- Name: ManagerPermissions ManagerPermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManagerPermissions"
    ADD CONSTRAINT "ManagerPermissions_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderSequence OrderSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderSequence"
    ADD CONSTRAINT "OrderSequence_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: metrics_snapshot metrics_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrics_snapshot
    ADD CONSTRAINT metrics_snapshot_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pincode_risk pincode_risk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pincode_risk
    ADD CONSTRAINT pincode_risk_pkey PRIMARY KEY (pincode);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: Address_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_userId_idx" ON public."Address" USING btree ("userId");


--
-- Name: Alert_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_createdAt_idx" ON public."Alert" USING btree ("createdAt");


--
-- Name: Alert_type_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_type_status_idx" ON public."Alert" USING btree (type, status);


--
-- Name: Alert_type_status_pincode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_type_status_pincode_idx" ON public."Alert" USING btree (type, status, pincode);


--
-- Name: CartItem_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");


--
-- Name: CartItem_cartId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON public."CartItem" USING btree ("cartId", "productId");


--
-- Name: CartItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");


--
-- Name: Cart_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_userId_idx" ON public."Cart" USING btree ("userId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: InventoryLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InventoryLog_createdAt_idx" ON public."InventoryLog" USING btree ("createdAt");


--
-- Name: InventoryLog_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InventoryLog_productId_idx" ON public."InventoryLog" USING btree ("productId");


--
-- Name: ManagerPermissions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ManagerPermissions_userId_idx" ON public."ManagerPermissions" USING btree ("userId");


--
-- Name: ManagerPermissions_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ManagerPermissions_userId_key" ON public."ManagerPermissions" USING btree ("userId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: OrderSequence_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderSequence_date_idx" ON public."OrderSequence" USING btree (date);


--
-- Name: OrderSequence_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OrderSequence_date_key" ON public."OrderSequence" USING btree (date);


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_createdAt_orderStatus_is_rto_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_orderStatus_is_rto_idx" ON public."Order" USING btree ("createdAt", "orderStatus", is_rto);


--
-- Name: Order_gatewayOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_gatewayOrderId_key" ON public."Order" USING btree ("gatewayOrderId");


--
-- Name: Order_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON public."Order" USING btree ("idempotencyKey");


--
-- Name: Order_is_manual_review_review_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_is_manual_review_review_status_createdAt_idx" ON public."Order" USING btree (is_manual_review, review_status, "createdAt");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderStatus_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderStatus_createdAt_idx" ON public."Order" USING btree ("orderStatus", "createdAt");


--
-- Name: Order_orderStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderStatus_idx" ON public."Order" USING btree ("orderStatus");


--
-- Name: Order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_paymentStatus_idx" ON public."Order" USING btree ("paymentStatus");


--
-- Name: Order_shippingPincode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_shippingPincode_idx" ON public."Order" USING btree ("shippingPincode");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_gatewayOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_gatewayOrderId_idx" ON public."Payment" USING btree ("gatewayOrderId");


--
-- Name: Payment_gatewayOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_gatewayOrderId_key" ON public."Payment" USING btree ("gatewayOrderId");


--
-- Name: Payment_gatewayPaymentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_gatewayPaymentId_key" ON public."Payment" USING btree ("gatewayPaymentId");


--
-- Name: Payment_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_orderId_idx" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_orderId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_orderId_status_idx" ON public."Payment" USING btree ("orderId", status);


--
-- Name: Payment_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_createdAt_idx" ON public."Payment" USING btree (status, "createdAt");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: ProductImage_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductImage_productId_idx" ON public."ProductImage" USING btree ("productId");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_isActive_idx" ON public."Product" USING btree ("isActive");


--
-- Name: Product_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_sku_idx" ON public."Product" USING btree (sku);


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_slug_idx" ON public."Product" USING btree (slug);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: RefreshToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_token_idx" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: metrics_snapshot_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX metrics_snapshot_date_idx ON public.metrics_snapshot USING btree (date);


--
-- Name: metrics_snapshot_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX metrics_snapshot_date_key ON public.metrics_snapshot USING btree (date);


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: pincode_risk_riskLevel_rtoPercentage_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pincode_risk_riskLevel_rtoPercentage_idx" ON public.pincode_risk USING btree ("riskLevel", "rtoPercentage");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLog InventoryLog_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ManagerPermissions ManagerPermissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManagerPermissions"
    ADD CONSTRAINT "ManagerPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_billingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--