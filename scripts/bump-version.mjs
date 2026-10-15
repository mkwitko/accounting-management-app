#!/usr/bin/env node
/**
 * Bump da versao do app. A versao vive so no package.json; o app.config.js le
 * dela e deriva os build numbers das lojas, entao `npx expo prebuild` gera:
 *
 *   version 1.0.1  ->  Android: versionName "1.0.1", versionCode 10001
 *                      iOS:     MARKETING_VERSION 1.0.1, CURRENT_PROJECT_VERSION 3
 *
 * Uso:
 *   yarn bump patch          # 1.0.0 -> 1.0.1
 *   yarn bump minor          # 1.0.0 -> 1.1.0
 *   yarn bump major          # 1.0.0 -> 2.0.0
 *   yarn bump 1.4.2          # versao explicita
 *   yarn bump --show         # so mostra o que o prebuild vai gerar hoje
 *   yarn bump patch --no-git # edita o package.json e para (sem commit nem tag)
 *
 * Por padrao cria o commit e a tag (`v1.0.1`) via `npm version`, sem push.
 *
 * iOS: o build number (CURRENT_PROJECT_VERSION) e um contador incremental
 * (+1 a cada bump), armazenado em `iosBuildNumber` no package.json — nao e
 * derivado do semver. Android (versionCode) continua pela formula semver.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(raiz, 'package.json')

function lerPkg() {
	return JSON.parse(readFileSync(pkgPath, 'utf8'))
}

function lerVersao() {
	return lerPkg().version
}

function lerIosBuild() {
	return Number(lerPkg().iosBuildNumber)
}

/** Incrementa iosBuildNumber em +1, salvando ordenado o package.json. */
function incrementarIosBuild() {
	const pkg = lerPkg()
	const novo = Number(pkg.iosBuildNumber) + 1
	pkg.iosBuildNumber = String(novo)
	writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n')
	return novo
}

/** Mesma formula do app.config.js. Manter as duas em sincronia. */
function versionCodeDe(versao) {
	const [major, minor, patch] = versao.split('.').map(Number)
	return major * 10000 + minor * 100 + patch
}

function mostrar(versao, iosBuild) {
	const android = versionCodeDe(versao)
	console.log(`\nversao ............... ${versao}`)
	console.log(`iOS build number ..... ${iosBuild}`)
	console.log(`Android versionCode .. ${android}`)
	console.log('\no que `npx expo prebuild` vai gerar:')
	console.log(`  Android  versionName "${versao}"   versionCode ${android}`)
	console.log(
		`  iOS      MARKETING_VERSION ${versao}   CURRENT_PROJECT_VERSION ${iosBuild}\n`,
	)
}

function git(...args) {
	return execFileSync('git', args, { cwd: raiz, encoding: 'utf8' }).trim()
}

const args = process.argv.slice(2)
const semGit = args.includes('--no-git')
const alvo = args.find((a) => !a.startsWith('--'))

if (args.includes('--show') || !alvo) {
	if (!alvo && !args.includes('--show')) {
		console.error(
			'Informe o bump: patch | minor | major | <x.y.z>  (ou --show para so consultar)',
		)
	}
	mostrar(lerVersao(), lerIosBuild())
	process.exit(alvo || args.includes('--show') ? 0 : 1)
}

const tipoValido = ['patch', 'minor', 'major'].includes(alvo)
const versaoExplicita = /^\d+\.\d+\.\d+$/.test(alvo)

if (!tipoValido && !versaoExplicita) {
	console.error(`Bump invalido: "${alvo}". Use patch, minor, major ou x.y.z.`)
	process.exit(1)
}

// Working tree suja com o package.json dentro faria o `npm version` falhar no
// meio do caminho; checar antes da uma mensagem melhor que a do npm.
if (!semGit && git('status', '--porcelain')) {
	console.error(
		'Working tree suja. Commite ou guarde as mudancas antes do bump\n' +
			'(ou use --no-git para so editar o package.json).',
	)
	process.exit(1)
}

const anterior = lerVersao()

execFileSync(
	'npm',
	[
		'version',
		alvo,
		...(semGit
			? ['--no-git-tag-version']
			: ['-m', 'chore: bump versao para %s']),
	],
	{ cwd: raiz, stdio: 'inherit' },
)

const nova = lerVersao()

// Incrementa o contador de build do iOS (+1). O `npm version` ja criou o
// commit/tag da `version`; com git, fazemos amend para incluir esse campo
// no mesmo commit. Sem git, so salvamos.
const iosAnterior = lerIosBuild()
const iosNova = incrementarIosBuild()

if (!semGit) {
	git('add', pkgPath)
	git('commit', '--amend', '--no-edit')
	// Recria a tag apontada para o commit amendado.
	git('tag', '-f', `v${nova}`)
}

// O versionCode do Android precisa ser estritamente crescente para o Google
// Play aceitar o upload. Uma versao explicita menor que a anterior passa pelo
// npm sem reclamar e so quebra no upload — melhor avisar aqui.
if (versionCodeDe(nova) <= versionCodeDe(anterior)) {
	console.warn(
		`\n⚠ versionCode (Android) nao aumentou (${versionCodeDe(anterior)} -> ${versionCodeDe(nova)}).\n` +
			'  O Google Play recusa upload com versionCode menor ou igual ao ja publicado.',
	)
}

console.log(`\n${anterior} -> ${nova}`)
console.log(`iOS build: ${iosAnterior} -> ${iosNova}`)
mostrar(nova, iosNova)

if (semGit) {
	console.log(
		'package.json alterado. Nenhum commit ou tag criado (--no-git).\n',
	)
} else {
	console.log(`commit e tag v${nova} criados localmente. Push nao foi feito.\n`)
}
