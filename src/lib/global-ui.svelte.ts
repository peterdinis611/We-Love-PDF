/** Shared UI state for command palette and shortcut help. */
class GlobalUiState {
	paletteOpen = $state(false);
	helpOpen = $state(false);

	setPaletteOpen(open: boolean) {
		this.paletteOpen = open;
	}

	togglePalette() {
		this.paletteOpen = !this.paletteOpen;
	}

	setHelpOpen(open: boolean) {
		this.helpOpen = open;
	}
}

export const globalUi = new GlobalUiState();
