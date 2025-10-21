# BeautyBooker - Sistema de Gestión para Centro de Belleza

BeautyBooker es una aplicación web completa diseñada para gestionar eficientemente las operaciones de un centro de belleza, incluyendo reservaciones, servicios y citas.

## Características Principales

- **Gestión de Reservaciones**: Los clientes pueden reservar citas (o hacer reservaciones) en línea.
- **Catálogo de Servicios**: Lista detallada de servicios ofrecidos con precios y duración.
- **Panel de Administración**: Para gestionar servicios, personal y horarios.
- **Gestión de Citas**: Vista y gestión de citas para administradores(empleados).
- **Perfiles de Usuario**: Para los clientes, se espera que los empleados de momento solo haya 1(administrador).
- **Sistema de Notificaciones**: Recordatorios de citas por email.

## Tecnologías Utilizadas

- **Frontend**: Angular 16
- **Backend**: FastAPI (Python)
- **Base de Datos**: MySQL
- **Contenedorización**: Docker

## Requisitos Previos

- Node.js (v16 de ser posible para evitar conflictos)
- Python 3.10+
- Docker y Docker Compose
- MySQL 8.0

## Configuración del Proyecto

1. Clonar el repositorio:
   ```
   git clone https://github.com/JEFL26/Proyecto_angular
   cd Proyecto_angular
   ```

2. Configurar variables de entorno:
   - Copia `.env.example` a `.env` y ajusta las variables según tu entorno.

3. Iniciar los contenedores Docker, construyendolos de paso y eliminando imagenes sin tag:
   ```docker compose build --no-cache && docker compose up -d && docker image prune -y
   Para bajarlos:
   ```docker compose down -v

4. Instalar dependencias del frontend:
   ```
   cd frontend
   npm install
   ```

5. Iniciar el servidor de desarrollo de Angular:
   ```
   ng serve
   ```

6. Acceder a la aplicación en `http://localhost:4200`

## Estructura del Proyecto

- `/frontend`: Código fuente de la aplicación Angular
- `/backend`: API FastAPI
- `/database`: Scripts de inicialización de la base de datos

## Desarrollo

- Para el frontend: `ng serve` desde el directorio `/frontend`
- Para el backend: Ejecuta comandos para crear el entorno virtual:
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --no-cache-dir -r requirements.txt
    uvicorn app.main:app --reload
- Para la base de datos: Haz estos comandos desde el directorio raiz para inicializar y crear todas las tablas y la base:
    
    mysql -u root -p beauty_center
    mysql> SOURCE database/init.sql;



Este es el .env cuando se desarrolla:
# Database Configuration
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=beauty_center
MYSQL_USER=
MYSQL_PASSWORD=
#MYSQL_PASSWORD=
#MYSQL_HOST=reservas_mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306

y asi es cuando desplegamos los contenedores:


Este es el .env cuando se construyen y levantan los contenedores:
# Database Configuration
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=beauty_center
MYSQL_USER=
#MYSQL_PASSWORD=
MYSQL_PASSWORD=
MYSQL_HOST=reservas_mysql
#MYSQL_HOST=localhost
MYSQL_PORT=3306


# Backend Configuration
SECRET_KEY=mi_llave_super_secreta_no_definida_aun
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App Configuration
APP_NAME=CentroBelleza
APP_VERSION=1.0.0
DEBUG=False

# Backend Configuration
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App Configuration
APP_NAME=CentroBelleza
APP_VERSION=1.0.0
DEBUG=False

## Despliegue

Instrucciones para desplegar en producción...(todavia no)

## Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz un Fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

Link del Proyecto: https://github.com/JEFL26/Proyecto_angular