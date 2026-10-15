require('dotenv').config()

const { version, iosBuildNumber } = require('./package.json')

// VersionCode do Android, derivado do semver: 1.2.3 -> 10203.
// Cada bump de versao gera um numero estritamente maior (crescente),
// sem contador separado para manter. Limite: minor e patch < 100.
const [major, minor, patch] = version.split('.').map(Number)
const androidVersionCode = major * 10000 + minor * 100 + patch

// Build number do iOS (CURRENT_PROJECT_VERSION): contador incremental
// (+1 a cada bump), lido de `iosBuildNumber` no package.json. O bump-script
// cuida de incrementa-lo; o semver so alimenta o MARKETING_VERSION.
const iosBuild = Number(iosBuildNumber)

export default {
	expo: {
		name: 'Plantio UDV',
		slug: 'udv-sustentabilidade',
		// Fonte unica: `version` do package.json. Use `yarn bump` para alterar.
		// O prebuild leva isso para versionName (Android) e MARKETING_VERSION (iOS).
		version,
		orientation: 'portrait',
		icon: './assets/images/icon.png',
		scheme: 'udvsustentabilidade',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,

		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.udv.sustentabilidade',
			// prebuild -> CURRENT_PROJECT_VERSION no projeto Xcode.
			// Contador incremental (nao derivado do semver), ve iosBuildNumber.
			buildNumber: String(iosBuild),
			// Adicionar associatedDomains se estiver usando Universal Links
			// associatedDomains: ['applinks:your-domain.com'],
		},

		android: {
			useNextNotificationsApi: true,
			package: 'com.udv.sustentabilidade',
			// prebuild -> versionCode no android/app/build.gradle
			versionCode: androidVersionCode,
			intentFilters: [
				{
					action: 'VIEW',
					data: [
						{
							scheme: 'udvsustentabilidade',
							// Permitir qualquer path
						},
					],
					category: ['BROWSABLE', 'DEFAULT'],
				},
			],
		},

		plugins: [
			[
				'expo-router',
				{
					origin: 'udvsustentabilidade://',
				},
			],
			'expo-font',
			[
				'expo-splash-screen',
				{
					image: './assets/images/splash-icon.png',
					imageWidth: 175,
					resizeMode: 'contain',
					backgroundColor: '#F9F9F9',
				},
			],
			'expo-secure-store',
			'./plugins/withAndroidReleaseSigning',
		],

		experiments: {
			typedRoutes: true,
		},

		extra: {
			router: {
				origin: false,
			},
			EXPO_PUBLIC_BACKEND: process.env.EXPO_PUBLIC_BACKEND,
			EXPO_OAUTH_CLIENT_ID: process.env.EXPO_OAUTH_CLIENT_ID,
		},
	},
}
