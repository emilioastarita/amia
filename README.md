# AMIA

Gestor de nodos y relaciones para generar un gráfico de los hechos e implicados
en el caso AMIA/Nisman.

## Instalación para devs

Para instalar localmente el aplicativo necesitas:

* node.js
* typescript
* mysql/mariadb
* npm
* bower
* gulp (recomendado para desarrollar)

### Instalar dependencias

```sh
$ npm install -g gulp bower typescript
$ npm install
$ bower install
```

### Creación de DB y usuario

```sql
create database amia;
grant usage on *.* to amia@localhost identified by 'PASSWORD_AMIA';
grant all privileges on amia.* to amia@localhost ;
FLUSH PRIVILEGES;
```

### Cargar base de datos

```sh
# primero crear base de datos luego cargar los create:
$ mysql -uUSER -pPASS DBNAME < sql/01-create-table.sql
```

### Archivo de configuración

Existe un archivo de configuración que se recomienda copiar para sobreescribir
las configuraciones personales como la de la base de datos.

```sh
$ cp config-default.json config-local.json
$ emacs config-local.json # dejar solo propiedades que se usan
```

### Directorio de temporales de compilación

```sh
$ mkdir -p tmp
```

### Para ejecutar en modo dev correr la default task de gulp

```sh
$ gulp
# correr con logs de debug
$DEBUG=amia,gulp:express gulp
```

### Crear usuario administrador

Los usuarios admin pueden crearse mediante una task de gulp:

```sh
$ gulp createAdmin --email 'admin@example.com' --password 'tuPass'
$ mkdir -p public/uploads
```
### URLs

Si no modifcaste las configuraciones deberías poder navegar a:

* http://localhost:3000
* http://localhost:3000/admin

## License

(The MIT License)

Copyright (c) 2009-2015 Emilio Astarita and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
