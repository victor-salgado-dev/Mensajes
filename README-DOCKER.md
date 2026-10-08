# Mensajes en un solo contenedor

El Dockerfile empaqueta PostgreSQL, el backend Express/Socket.IO y el frontend React compilado. PostgreSQL solo escucha dentro del contenedor. Al iniciar, el entrypoint crea el esquema, aplica las migraciones y carga datos demo si todavia no existe el marcador de seed.

## Ejecutar localmente

```sh
docker build -t mensajes .
docker run --rm -p 10000:10000 -e JWT_SECRET=local-demo-secret mensajes
```

Abre `http://localhost:10000`. El login para las diez cuentas usa la misma contrasena: `Demo123!`.

Usuarios: Anna, Ben, Clara, David, Emilia, Felix, Greta, Jonas, Lena y Max. Todas las parejas son contactos aceptados y tienen mensajes de ejemplo en aleman.

## Render

Conecta el repositorio a Render como Blueprint para usar `render.yaml`, o crea un Web Service con runtime Docker y el Dockerfile en la raiz. No configures `DATABASE_URL` ni agregues un servicio de base de datos externo: el entrypoint usa PostgreSQL dentro del mismo contenedor. Render genera `JWT_SECRET` desde el blueprint.

El almacenamiento del contenedor de Render es efimero. Al desplegar un contenedor nuevo se crea una base vacia y se regenera el seed. El seed es idempotente ante reinicios del mismo contenedor para no duplicar mensajes.

Las cuentas son datos publicos de demostracion. No reutilices esta imagen para informacion privada sin cambiar el seed, la contrasena y la configuracion de persistencia.