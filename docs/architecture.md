# How the game is organised

## Main parts

`App` handles menus, input ownership, saves, loading and the frame loop. Its settings, tactical, scoreboard and HUD helpers update the display without taking over the game lifecycle.

`Simulation` holds the game state. That includes soldiers, vehicles, combat, progression events and debris. Actor creation and spawning are separate from player, NPC and vehicle updates. The Simulation methods bring those modules together.

`World` holds voxels, damage, structures, navigation data and mesh jobs. `Renderer` owns the GPU resources and drawing. Model drawing and the canvas HUD are separate from scene submission.

## Frame loop

The simulation runs at 30 updates per second. A rendered frame can run up to three updates to catch up. Those updates share one destruction budget.

Rendering interpolates between the previous and current poses. It does not write the interpolated positions back into the simulation.

Work that cannot finish keeps its place for a later update. Physics time is retained rather than dropped. The budgets are cooperative, so a single work unit or garbage collection can still take longer than expected.

## World and destruction

The world uses a 512 × 512 × 112 byte voxel array for materials. Partial damage is stored separately. `damageVoxel` updates structural revisions even when the voxel survives the hit.

Detached structures are prepared before they are removed from terrain. Voxel identity, damage and material coordinates survive detachment, fracture and settlement. If the source changes during preparation, that work is discarded.

Collision trees speed up queries without filling the holes in a structure. Rotated geometry is checked against its actual orientation. Projectile paths are checked from the firing position to the muzzle and then through the rest of the flight.

A pending motion job keeps its proposed pose and timestep. It only publishes when its inputs are still valid. Cancelling a round closes pending jobs and clears their caches.

Secondary debris is capped at 96 bodies. Primary structural pieces are tracked separately. A fragment waiting for capacity retains its work and retries when space becomes available.

## Debris impacts and vehicles

Debris impacts keep the previous position and orientation. Occupied voxels are swept through short rotation intervals. Damage uses velocity at the contact point, including rotation. Shields and the hit records prevent unwanted repeat damage.

Vehicle pushes are checked as a group. Every proposed infantry position must fit around the world, debris, other vehicles and other soldiers before anyone moves. A blocked proposal stops the push.

## NPCs and navigation

NPCs share a scheduled work quota and a separate quota for immediate reactions. Hazards take priority, followed by immediate threats, support work and squad movement.

Squads remember observations that expire. They do not keep live positions for enemies they cannot see. Leadership can transfer after a casualty, while the player's selected role remains intact.

Shared flow fields handle street routes. Local A* handles floors, rubble and lift links, with up to 64 active searches. Routes record the revisions they depend on and recheck waypoints before movement.

## Equipment

Loadouts are resolved at deployment. Changing a menu selection does not replace a live inventory. Primary and secondary ammunition, reloads, equipment charges and cooldowns are tracked separately.

Live thrown projectiles and NPC predictions use the same flight code. Smoke visibility and solid collision are separate queries. The renderer and NPCs use the same smoke state.

Supply bags track their owner, lifetime, charges and recipient cooldowns. Supplies need a valid floor, range and clear access. Player reserves remain separate from loaded magazines.

Base resupply uses the active scenario's team homes and a thirty unit forward margin. Recent damage interrupts the timer.

## Graphics

Terrain and debris vertices use ten floats for position, normal, colour and material. Instances use fourteen floats. Shader layouts and mesh producers must agree on those formats.

Textures and audio are generated locally. The game does not fetch remote assets. Material coordinates stay attached to debris when it moves.

Renderer construction releases resources if an allocation fails. Disposal can safely run more than once. Mesh jobs only publish when their chunk revision still matches.

## Screens and saves

App owns screen transitions and focus. Dialogs make the underlying screens inert. Event listeners belong to an AbortSignal so they can be removed together.

Menus stay within the viewport and allow contained scrolling when needed. Collections use pages and item selection. Tactical roster pagination is separate from simulation state.

Saves belong to the player's browser. A session checkpoint is written first, followed by a guarded canonical write through Web Locks or IndexedDB. If another tab has changed the save, the game reports a conflict. Recovery from conflicting sessions needs a player choice.

The source contains save handling and generated test fixtures. It does not contain a player's browser database or exported career.

## Builds

The TypeScript and Bun builders share HTML packaging and CSP generation. The portable TypeScript builder produces the distributed files. The Bun builder provides a separate build check.

The release manifest uses an explicit public file inventory. Reproducibility checks build twice in an isolated copy and compare the output bytes. Local data and temporary test output stay outside that inventory.
