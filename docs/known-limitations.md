# Current limits

Battlevox is a local single player game. Saves depend on browser storage. Different file URLs, server addresses or ports can have separate profiles.

Heavy destruction can build up a physics backlog. The game keeps that time for later updates, but individual work units and garbage collection can still exceed the frame budget. CPU benchmarks do not tell you the rendered frame rate.

Browser tests cover menus and graphics commands. Audio, mouse capture, combat rendering and long sessions still need testing on the machine you want to play on.

Rotating debris uses short swept intervals rather than an exact continuous rotation solver. The intervals keep the approximation below the voxel collision inset.

Vehicles stop when a group push would overlap soldiers or hit an obstruction. They do not push a chain of soldiers out of the way, so a crowd can block an APC.

Bases use strips extending from each team's home towards its map edge, with a thirty unit forward margin. They are not enclosed supply rooms.

Very large text scaling needs more manual checks. Menus allow contained scrolling, and small combat screens hide some secondary HUD information to leave room for the main controls.
