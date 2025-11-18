// src\Commands\hltv\data\htmlScrapeData.ts

export const liveMatchesHTMLData = {
    MATCHES_URL: 'https://www.hltv.org/matches',

    liveMatchDiv: 'div.liveMatches',

    liveMatchWrapper: 'div.match-wrapper.live-match-container',

    liveMatchTop: 'a.match-top',
    liveMatchTopEventName: 'div.match-event.text-ellipsis',

    liveMatchInfo: 'a.match-info',

    liveMatchTeams: 'a.match-teams',
    liveMatchTeamNames: 'div.match-teamname',

    liveMatchScore: 'a.match-team-livescore',
    liveMatchScoreCurrentScore: 'span.current-map-score',
    liveMatchScoreMapScore: 'span.map-score'
};

export const playerStatsHTMLData = {
    STATS_URL: 'https://www.hltv.org/stats/players/[id]/[player]',

    summaryStats: 'div.stats-section.stats-player.stats-player-overview',

    playerBodyShot: 'img.player-summary-stat-box-left-bodyshot',

    topStatsContainer: 'div.player-summary-stat-box',

    mapCount: 'div.player-summary-stat-box-right-map-count',

    sideRating: 'div.player-summary-stat-box-side-rating-background-wrapper',
    boxRating: 'div.player-summary-stat-box-rating-data-text',
    boxRatingType: 'div.player-summary-stat-box-data-description-text',

    performanceMetrics: 'div.player-summary-stat-box-data-wrapper',

    roleStatsScore: 'div.row-stats-section-score'
};

