// eslint-disable-next-line import/no-anonymous-default-export
export default "";

declare module "@mui/material/Button" {
	interface ButtonPropsVariantOverrides {
		filled: true;
	}

	interface ButtonPropsColorOverrides {
		white: true;
		yellow: true;
	}
}

declare module "@mui/material/styles" {
  interface Palette {
    yellow?: PaletteColorOptions;
  }
  interface PaletteOptions {
    yellow?: PaletteColorOptions;
  }
}
