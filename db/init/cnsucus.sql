CREATE TABLE public.clientes (
    rut character varying(50) NOT NULL,
    cliente character varying(50),
    telefono integer,
    email character varying(50)
);

CREATE TABLE public.cotizaciones (
    codigo_cotizacion character varying(50),
    codigo_cliente character varying(50),
    cliente character varying(50),
    fecha_cotizacion date,
    giro character varying(50),
    comentario character varying(150),
    monto_neto integer,
    iva integer,
    monto_total integer
);

CREATE TABLE public.item_cotizacion (
    codigo_item character varying(50),
    codigo_cotizacion character varying(50),
    codigo_producto character varying(50),
    producto character varying(50),
    cantidad integer,
    monto_total integer
);

CREATE TABLE public.item_venta (
    codigo_item character varying(50) NOT NULL,
    codigo_venta character varying(50),
    codigo_producto character varying(50),
    producto character varying(50),
    cantidad integer,
    monto_total integer
);

CREATE TABLE public.productos (
    codigo character varying(50) NOT NULL,
    nombre character varying(50),
    costo integer,
    stock integer
);

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(100),
    password character varying(100)
);

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;

CREATE TABLE public.ventas (
    codigo_venta character varying(50) NOT NULL,
    codigo_cliente character varying(50),
    cliente character varying(50),
    fecha_venta character varying(50),
    metodo_pago character varying(50),
    monto_neto integer,
    iva integer,
    monto_total integer
);

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (rut);

ALTER TABLE ONLY public.item_venta
    ADD CONSTRAINT item_venta_pkey PRIMARY KEY (codigo_item);

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (codigo);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (codigo_venta);

ALTER TABLE ONLY public.item_venta
    ADD CONSTRAINT fk_item_venta_ventas FOREIGN KEY (codigo_venta) REFERENCES public.ventas(codigo_venta);
