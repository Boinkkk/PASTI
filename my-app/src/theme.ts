import { extendTheme } from '@mui/joy/styles';


declare module '@mui/joy/styles' {
  interface PaletteBackgroundOverrides {
    main: true;
    secondary: true;
  }
}


const theme = extendTheme({
  "colorSchemes": {
    "light": {
      "palette": {
        "background": {
          "main": "#355886",
          "secondary": "#F9B862"
        }
      }
    },
    "dark": {
      "palette": {}
    }
  }
})

export default theme;