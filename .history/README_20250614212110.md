# 🤖 Control Robot ESP32 vía React Native

Aplicación móvil desarrollada en **React Native** para controlar un robot basado en **ESP32** mediante comandos HTTP `POST`. Los movimientos permitidos son: **adelante**, **atrás**, **izquierda**, **derecha** y **stop**.

## 📱 Características

- Interfaz sencilla e intuitiva.
- Envío de comandos por `fetch` sin usar Axios.
- Separación modular: componentes y estilos.
- Compatible con cualquier red Wi-Fi local.

## 🏗️ Estructura del Proyecto


## ⚙️ Requisitos

- Node.js y npm
- React Native CLI o Expo (`npx react-native` o `npx expo`)
- Un ESP32 conectado a una red Wi-Fi local
- Un dispositivo móvil en la misma red

## 🚀 Cómo Ejecutar

1. Clona este repositorio:

```bash
git clone https://github.com/tuusuario/control-robot-esp32.git
cd control-robot-esp32
npm install
# o
yarn install

npx react-native run-android
# o si usas Expo:
npx expo start
const ESP32_IP = 'http://192.168.157.176/comando';
