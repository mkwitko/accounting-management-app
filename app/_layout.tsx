import { Slot } from 'expo-router'
import './../global.css'
import { Providers } from '@/src/providers'
import React from 'react'

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'react-native'

export default function RootLayout() {

	return (
		<GestureHandlerRootView
			style={{
				flex: 1,
			}}
		>
			<StatusBar barStyle="dark-content" />
			<Providers>
				<Slot />
			</Providers>
		</GestureHandlerRootView>
	)
}
