export const pageStyles = {
  dashboard: {
    background: 'linear-gradient(180deg, #FF4E8D 0%, #FF9966 50%, #FFD93D 100%)',
    buttonColor: '#FF4E8D',
  },
  goal: {
    background: 'linear-gradient(to bottom, #D061DE 0%, #62D8E7 51.442%, #45E2EB 100%)',
    buttonColor: '#D061DE',
  },
  allAccounts: {
    background: 'linear-gradient(to bottom, #00bb16 0%, #30fdd4 50%, #9dfaff 100%)',
    buttonColor: '#00bb16',
  },
  history: {
    background: 'linear-gradient(to bottom, #06b6d4 0%, #34d376 50%, #faeb42 100%)',
    buttonColor: '#06b6d4',
  },
  settings: {
    background: 'linear-gradient(180deg, #FF4E8D 0%, #FF9966 50%, #FFD93D 100%)',
    buttonColor: '#FF4E8D',
  },
} as const

export type PageType = keyof typeof pageStyles
