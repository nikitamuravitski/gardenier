import { Game } from '@/core/Game'

// Initialize game
const game = new Game()

// Start game loop
game.start()

// Handle window resize
window.addEventListener('resize', () => {
  game.resize()
})
