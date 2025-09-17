export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

export type Theme = 
  | 'classic-improved' 
  | 'classic' 
  | 'first-blood' 
  | 'hanna' 
  | 'mystical' 
  | 'mystical-hd';