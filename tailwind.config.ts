
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Updated enterprise-level color palette for Navneet Industries
				navneet: {
					dark: '#1E293B', // More professional dark blue
					gray: '#64748B', // Refined slate gray
					orange: '#E25822', // More vibrant and professional orange
					light: '#F8FAFC', // Cleaner light background
					accent: '#0EA5E9', // Professional blue accent
					muted: '#F1F5F9', // Light gray for backgrounds
				},
				// Apple Intelligence-inspired color palette
				apple: {
					purple: {
						light: '#BF5AF2',
						DEFAULT: '#A855F7',
						dark: '#7E22CE',
					},
					blue: {
						light: '#60A5FA',
						DEFAULT: '#3B82F6',
						dark: '#1D4ED8',
					},
					teal: {
						light: '#5EEAD4',
						DEFAULT: '#14B8A6',
						dark: '#0F766E',
					},
					pink: {
						light: '#F472B6',
						DEFAULT: '#EC4899',
						dark: '#BE185D',
					},
				},
				glass: {
					white: 'rgba(255, 255, 255, 0.1)',
					light: 'rgba(255, 255, 255, 0.05)',
					dark: 'rgba(0, 0, 0, 0.1)',
				},
				// Futuristic cyan palette
				cyber: {
					cyan: {
						light: '#00F5FF',
						DEFAULT: '#00D9FF',
						dark: '#0099CC',
					},
					blue: {
						light: '#4DD0E1',
						DEFAULT: '#00BCD4',
						dark: '#0097A7',
					},
					glow: 'rgba(0, 217, 255, 0.5)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'enterprise': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
				'enterprise-lg': '0 10px 30px -3px rgba(0, 0, 0, 0.1)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
				'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
				'glow': '0 0 20px rgba(168, 85, 247, 0.4)',
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
				'glow-teal': '0 0 20px rgba(20, 184, 166, 0.4)',
				'glow-orange': '0 0 20px rgba(226, 88, 34, 0.4)',
				'glow-cyan': '0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3)',
				'glow-cyan-lg': '0 0 40px rgba(0, 217, 255, 0.8), 0 0 80px rgba(0, 217, 255, 0.4), 0 0 120px rgba(0, 217, 255, 0.2)',
				'volumetric': '0 20px 60px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				DEFAULT: '8px',
				md: '12px',
				lg: '16px',
				xl: '24px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				'slide-in': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1',
					},
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(20px)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1',
					},
				},
				'spin-reverse': {
					'0%': {
						transform: 'rotate(0deg)',
					},
					'100%': {
						transform: 'rotate(-360deg)',
					},
				},
				'float': {
					'0%': {
						transform: 'translateY(100vh)',
						opacity: '0',
					},
					'20%': {
						opacity: '0.6',
					},
					'80%': {
						opacity: '0.6',
					},
					'100%': {
						transform: 'translateY(-100px)',
						opacity: '0',
					},
				},
				'gradient-shift': {
					'0%, 100%': {
						backgroundPosition: '0% 50%',
					},
					'50%': {
						backgroundPosition: '100% 50%',
					},
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
					},
					'50%': {
						boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
					},
				},
				'glass-float': {
					'0%, 100%': {
						transform: 'translateY(0px)',
					},
					'50%': {
						transform: 'translateY(-10px)',
					},
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0',
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in': 'slide-in 0.7s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'spin-slow': 'spin 20s linear infinite',
				'spin-slow-reverse': 'spin-reverse 15s linear infinite',
				'spin-medium': 'spin 10s linear infinite',
				'float-particle': 'float 5s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'glass-float': 'glass-float 6s ease-in-out infinite',
				'scale-in': 'scale-in 0.3s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
