import { cn } from '@/src/lib/utils'
import { Feather } from '@expo/vector-icons'
import * as React from 'react'
import {
	Platform,
	TextInput,
	TextInputProps,
	TouchableOpacity,
	View,
} from 'react-native'

interface SecureInputProps extends TextInputProps {
	error?: boolean
}

export const SecureInput = React.forwardRef<TextInput, SecureInputProps>(
	({ className, error, ...props }, ref) => {
		const [isVisible, setIsVisible] = React.useState(false)

		return (
			<View
				className={cn(
					'w-full bg-white px-4 flex items-center flex-row h-14 rounded-xl border border-zinc-200',
					error && 'border-red-600',
				)}
			>
				<TextInput
					ref={ref}
					textContentType="password"
					className={cn(
						'h-full bg-transparent flex-1 text-lg placeholder:text-zinc-400 font-body',
						Platform.OS === 'ios' && 'mb-2.5',
						Platform.OS === 'android' && 'text-black',
						className,
					)}
					secureTextEntry={!isVisible}
					{...props}
				/>

				<TouchableOpacity
					onPress={() => setIsVisible(!isVisible)}
					activeOpacity={0.7}
				>
					<Feather
						size={20}
						color="#a1a1aa"
						name={isVisible ? 'eye-off' : 'eye'}
					/>
				</TouchableOpacity>
			</View>
		)
	},
)
