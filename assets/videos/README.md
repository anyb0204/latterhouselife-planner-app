# Video assets

Drop the room background videos into this folder using these exact filenames
(referenced directly by `index.html` / `js/main.js`). Until a file is present,
its card falls back to a themed gradient instead of breaking.

## Primary (used by default)

- `R_crashing_waves.mp4` — Resources
- `C_group_of_old_men_talking.mp4` — Community
- `S_hands_on_bible.mp4` — Scripture
- `T_man_working_with_tools.mp4` — Tools
- `L_woman_sitting_in_front_of_book_shelf.mp4` — Library

## Backups (swap in via `ROOMS[...].video` in `js/main.js`)

- `R_majestic_waterfall_one_person_way_back.mp4`
- `R_ocean_view_behind_a_stalk_of_wheat.mp4`
- `R_wow_exotic_cliff_formation_beach.mp4`
- `R_tall_grass_blowing.mp4`
- `C_funny_couple_dancing.mp4`
- `c_couple_talking.mp4`
- `S_bible_study_group.mp4`
- `S_man_on_stairs_reading_bible.mp4`
- `S_man_singing_in_choir_robe.mp4`
- `L_man_reading_with_glasses___magnifying_glass.mp4`
- `L_man_hands_turning_pages_in_a_book.mp4`
- `L_peeking_around_a_corner_at_a_interesting_architectural_library.mp4`
- `t_men_on_high_rise_scaffolding.mp4`
- `t_woman_hands_on_a_keyboard.mp4`
- `t_gears_shifting.mp4`
- `t_woman_counting_cash.mp4`

Keep files reasonably compressed (H.264 MP4, ~5–10s loops) since all five
play simultaneously once the carousel loads.
