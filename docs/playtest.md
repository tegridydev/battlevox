# Playtest checklist

These are the checks I want covered before calling a build ready. Automated checks are described in [Checks](validation.md).

## Startup and saves

Open `PLAY.html`, then try the local web server. Both should reach the main menu without console errors. With WebGL disabled, the game should show a readable error instead of staying on the loading screen.

Use a fresh browser profile to check the starting state. There should be no previous matches or earned progress. A browser you have used before may load its own save.

Earn some XP, pause, close the tab and reopen it. Check export and recovery. Open two tabs, earn different progress in each and check that a save conflict is reported instead of silently replacing progress.

## Menus

Open every menu, tab, equipment view and overlay. Include the scoreboard, deployment, orders, confirmation dialogs and field lab.

Check desktop, phone portrait and short landscape sizes. Try keyboard navigation, touch controls, reduced motion, a long callsign and larger text. Content should remain reachable without clipping. Cancelling a dialog must not run its action.

## Combat

Start Civic Frontline with 60 soldiers per team. Check mouse capture, aiming, audio, movement, crouching, sprinting, jumping, mantling, weapon switching and reloads.

Fire near walls and under overhangs. Rockets and vehicle shells should hit cover instead of appearing on the other side. Friendly soldiers should block firing lanes without granting XP for friendly fire.

## Classes and equipment

Try every sidearm with every class. Changing a selection while alive must not replace the weapon you are carrying or refill its magazine. Check quick semi automatic taps, automatic fire, interrupted reloads, scope magnification and touch controls.

Test healing, revives, resupply, repairs, cover placement and spotting. Repairs should fail through walls, from the wrong floor and from inside a vehicle. Spot a moving enemy again and check that the marker updates.

Place supplies on streets, upper floors and stable rubble. Try blocked access, multiple crates, owner death and a destroyed supporting floor. Replenishing reserves must not refill a loaded magazine or award repeated XP for supplying yourself.

## Smoke and destruction

Throw smoke indoors, near the camera and behind cover. Foreground objects should stay visible. Dense smoke should hide targets from observation while bullets still pass through.

Undermine buildings and watch detachment, movement, fracture and settlement. Remove a support from resting debris. Check that holes remain empty and material patterns stay attached as pieces rotate.

Rotate a long section into soldiers and vehicles with little forward movement. Check shielding and repeated contact. Drive an APC towards crowds and debris. A blocked push must not overlap soldiers or move only part of the group.

For both teams in both scenarios, test base resupply, leaving the base boundary and taking damage during the supply timer.

## Navigation and longer matches

Block a route with rubble and check that soldiers find another path without teleporting. Use a lift, then destroy its destination landing and check that it cannot be used.

Play Metropolis with 500 soldiers per team. Run a full match with several collapses, finish it and start another. Check the results, career history, minimap and memory use. Watch whether delayed physics work clears after combat settles down.

Practice options and repositioning through the field lab should stop career rewards for the rest of that round.

## Graphics and performance

Try each lighting preset, shadows, textures and brightness settings. Check terrain, water, glass, uniforms, weapons and debris during combat.

Measure rendered frame times on real hardware. Keep those results separate from the CPU simulation benchmark. Listen for audio problems and watch for growing CPU, GPU or memory use over repeated matches.
