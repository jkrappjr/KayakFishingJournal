# Website → mobile migration

First collection migration: November 7, 2026. Target is the Render test app; production website is unchanged.

## Verified source data

Read the public website API, not private trip/account tables, for the release dataset:
- https://kayakfishingjournal.com/api/community-reports — six reports; no next page on this import.
- https://kayakfishingjournal.com/api/anglers — eleven public profiles; no next page on this import.

128 catches across six published trips, 23 publicly selected trip photos. Four John Rapp reports = 98 catches; Heath Mullins = one report / 14 catches; Rick Garavaglia = one report / 16 catches. These match the website profile totals. Profiles with additional private/unpublished trips retain their website aggregate totals; published cards are a subset and are never added again.

Explicit author bindings store the website public directory ID for each verified author. A report display name is never treated as proof of account ownership. Imported reports are read-only in the public collection. No import into personal storage and no automatic account linking. Local trips remain local. Data import is a dated snapshot, not live synchronization. Photos and source report links resolve on the original website and require connectivity; profiles have compressed local photos. Refresh/unpublish synchronization requires an API connection in a later phase.

## Page inventory and priorities

| Area | Test app now | Remaining website parity |
|---|---|---|
| Home and learning | Graphic header, river lessons, 13 bait families, science and knot controls | Full lesson checks, research references, progress |
| Community reports | Six public trip cards; full stories, photos, Best Five, saved science, search and public sharing links | Live updates, publish/unpublish, moderation, likes |
| Directory | Eleven public profiles, About Me, affiliations, source stats, author report collection | Account-bound editing, public opt-out changes, follow/social tools |
| My journal | Local offline trip sessions and saved locations/science | Full journal form, photos, equipment, companions, editing, export/PDF and poster variants |
| Conditions | Trip-specific snapshots, locations, manual/live historical readings | Full gauge map, hydrographs, forecast, saved gauges and freshness UI |
| Tournaments | Existing small event list; link to website calendar | Complete event inventory, filters, club associations and log-event flow |
| Clubs | Link to existing clubs page | Code access, membership, club admin, AOY and sponsor cards |
| Launches | Link to existing public launches | Native launch map, route planning, access details |
| Fish identification | Link to existing fish-ID page | Photo capture and complete identification flow |
| Research and policies | Links to existing pages | Native reading views and consent/account workflow |
| Admin | Remains on production | Authenticated moderation; never expose private admin rows in static assets |

Next implementation sequence: full offline journal form and photo/catch capture → authenticated owner data connection → live public report/directory projection → visual trip poster/export templates → conditions maps and forecast → tournament/club workflows. Existing website tools remain reachable through Explore the Website; they are explicitly labeled external, not presented as migrated native features.

## Mobile reference patterns

Use interface patterns, with our own artwork and data. Do not copy third-party artwork, paid map layers, private APIs or forecast scores.

- onX Fish: saved waypoints with photos/notes, clear offline/download state. https://www.onxmaps.com/fish/app/features/offline-maps
- FarWide: access points, route tools and map layers. https://www.farwide.com/app
- Fishing Knots / ProKnot: step illustrations, animated playback, knot-use explanations. https://proknot.com/pages/knot-apps
- BassForecast: location-first condition summaries, bait selections and bite-window views. Keep measured/modelled source labels; never substitute an invented proprietary score. https://bassforecast.com/features
- MyCatch: catch-first logging, personal stats, trip/event linkage. https://www.anglersatlas.com/research
- Rivercast: favorite gauges, readings with timestamps, CFS/feet controls, observed versus forecast graphs. https://www.rivercastapp.com/userguide.html
- “Investigator”: exact app identity remains unresolved; no design or data claims attributed to it.

## Validation

Automated DOM checks cover all six full reports, all report-to-author and author-to-report links, profile totals, photo counts, search filtering, missing records/fields, zero science readings, content escaping, offline asset paths and no writes to personal journal storage. Browser visual QA unavailable in this session. Public photo URLs are counted and preserved, not asserted to be downloaded offline. Text/time values preserve the current published records even where older conversation examples differ.
