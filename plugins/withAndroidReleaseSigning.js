// Expo config plugin: injeta o signingConfig `release` no android/app/build.gradle
// durante o `expo prebuild`. Em CI (Codemagic exporta CI=true) usa o keystore
// via env vars (CM_KEYSTORE_*). Localmente cai no debug keystore.
//
// Assim toda regeneracao do prebuild ja sai com o signing correto — sem edicao manual.
const { withAppBuildGradle } = require('expo/config-plugins')

const RELEASE_SIGNING_BLOCK = `        release {
            if (System.getenv()["CI"]) { // CI=true e exportado pelo Codemagic
                storeFile file(System.getenv()["CM_KEYSTORE_PATH"])
                storePassword System.getenv()["CM_KEYSTORE_PASSWORD"]
                keyAlias System.getenv()["CM_KEY_ALIAS"]
                keyPassword System.getenv()["CM_KEY_PASSWORD"]
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`

function patchGradle(contents) {
  let gradle = contents

  // 1) Adiciona o signingConfig `release` (idempotente).
  if (!gradle.includes('release {\n            if (System.getenv()["CI"]')) {
    gradle = gradle.replace(
      `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`,
      `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
${RELEASE_SIGNING_BLOCK}`,
    )
  }

  // 2) buildTypes.release passa a usar signingConfigs.release (idempotente).
  gradle = gradle.replace(
    `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`,
    '            signingConfig signingConfigs.release',
  )

  return gradle
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('withAndroidReleaseSigning: build.gradle nao e groovy — plugin nao aplicado.')
    }
    const patched = patchGradle(config.modResults.contents)
    if (!patched.includes('signingConfig signingConfigs.release')) {
      throw new Error('withAndroidReleaseSigning: falhou ao injetar signing (template mudou?).')
    }
    config.modResults.contents = patched
    return config
  })
}
