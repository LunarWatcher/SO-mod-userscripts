// ==UserScript==
// @name         Mod Flagger Stats
// @description  Post hover in mod flag queue, get and display flaggers stats. Badge links to user's flag history. Non-mods only can view their own flag badge on profile.
// @homepage     https://github.com/samliew/SO-mod-userscripts
// @author       @samliew
// @version      3.5.1
//
// @updateURL    https://github.com/samliew/SO-mod-userscripts/raw/master/ModFlaggerStats.user.js
// @downloadURL  https://github.com/samliew/SO-mod-userscripts/raw/master/ModFlaggerStats.user.js
//
// @include      https://*stackoverflow.com/users/*
// @include      https://*serverfault.com/users/*
// @include      https://*superuser.com/users/*
// @include      https://*askubuntu.com/users/*
// @include      https://*mathoverflow.net/users/*
// @include      https://*.stackexchange.com/users/*
//
// @include      https://*stackoverflow.com/admin/dashboard*
// @include      https://*serverfault.com/admin/dashboard*
// @include      https://*superuser.com/admin/dashboard*
// @include      https://*askubuntu.com/admin/dashboard*
// @include      https://*mathoverflow.net/admin/dashboard*
// @include      https://*.stackexchange.com/admin/dashboard*
//
// @exclude      *chat.*
//
// @require      https://raw.githubusercontent.com/samliew/ajax-progress/master/jquery.ajaxProgress.js
// ==/UserScript==


/* ===== Global utility functions ===== */
unsafeWindow.lsRemoveItemsWithPrefix = function(prefix) {
    const store = window.localStorage;
    let count = 0;
    for(let i = store.length - 1; i >= 0; i--) {
        const key = store.key(i);
        if(key && key.indexOf(prefix) === 0) {
            store.removeItem(key);
            count++;
        }
    }
    console.log(count + ' items cleared');
    return count;
};
unsafeWindow.purgeUserFlagStats = function() {
    lsRemoveItemsWithPrefix('ModFlaggerStats');
};


(function() {
    'use strict';


    const store = window.localStorage;
    const isModPage = () => document.body.classList.contains('mod-page');


    const repStrToNumeric = v => v.replace(/k/, '000').replace(/[^\d]/g, '') * 1 || 0;


    function calculateFlagTier(fTotal = 0, fPerc = 0) {
        // Default
        let v = { tier: 0, name: 'default' };

        // Elite Tier
        if((fPerc < 0.2 && fTotal >= 10000) || (fPerc < 0.1 && fTotal >= 5000)) {
            v = { tier: 4, name: 'elite' };
        }

        // Gold Tier
        else if((fPerc < 1 && fTotal >= 2000) || (fPerc < 0.5 && fTotal >= 1000)) {
            v = { tier: 3, name: 'gold' };
        }

        // Silver Tier
        else if((fPerc < 3 && fTotal >= 1000) || (fPerc < 1.5 && fTotal >= 500)) {
            v = { tier: 2, name: 'silver' };
        }

        // Bronze Tier
        else if((fPerc < 5 && fTotal >= 500) || (fPerc < 2.5 && fTotal >= 200)) {
            v = { tier: 1, name: 'bronze' };
        }

        // Wtf Tier
        else if(fPerc >= 30 && fTotal >= 5) {
            v = { tier: -3, name: 'wtf' };
        }

        // Horrible Tier
        else if(fPerc >= 20 && fTotal >= 5) {
            v = { tier: -2, name: 'horrible' };
        }

        // Hmmm Tier
        else if(fPerc >= 10 && fTotal >= 5) {
            v = { tier: -1, name: 'hmmm' };
        }

        return v;
    }


    function getUserFlagStats(uid) {
        const keyroot = 'ModFlaggerStats';
        const fullkey = `${keyroot}:${uid}`;
        let v = JSON.parse(store.getItem(fullkey));

        return new Promise(function(resolve, reject) {
            if(v != null) { resolve(v); return; }

            $.ajax(`https://${location.hostname}/users/flag-summary/${uid}`)
                .done(function(data) {
                    const rep = repStrToNumeric($('.user-details .reputation-score', data).text());
                    const infotable = $('#sidebar .s-sidebarwidget--item.d-block', data);

                    let fTotal = 0, fTotalElem = infotable.find('a .ta-right').first();
                    if(fTotalElem.length != 0) fTotal = Number(fTotalElem.text().replace(/[^\d]+/g, ''));

                    let fDeclined = 0, fDeclinedElem = infotable.find('a[href="?group=1&status=3"] .ta-right').first();
                    if(fDeclinedElem.length != 0) fDeclined = Number(fDeclinedElem.text().replace(/[^\d]+/g, ''));

                    const fPerc = Number((fDeclined / (fTotal || 1) * 100).toFixed(2));

                    // store regular good flaggers
                    if((fPerc < 1 && fTotal >= 1000) || fTotal >= 10000) {
                        store.setItem(fullkey, JSON.stringify([rep, fTotal, fDeclined, fPerc]));
                    }

                    resolve([rep, fTotal, fDeclined, fPerc]);
                })
                .fail(reject);
        });
    }


    function loadFlaggingFn() {

        if($(this).hasClass('js-userflagstats-loaded') || $(this).hasClass('js-userflagstats-loading')) return;
        const uid = this.dataset.uid;
        const sameUserLinks = $(`.js-post-flag-group a[href^="/users/${uid}/"]`).addClass('js-userflagstats-loading');
        const currLink = $(this).addClass('js-userflagstats-loading');

        getUserFlagStats(uid).then(function(v) {
            const tier = calculateFlagTier(v[1], v[3]);
            const badge = `<a href="/users/flag-summary/${uid}" class="flag-badge ${tier.name}" title="${tier.name} flagger: ${v[1]} flags, ${v[2]} declined (accuracy ${(100 - v[3]).toFixed(2)}%)" target="_blank"><svg aria-hidden="true" class="svg-icon iconFlag" width="17" height="17" viewBox="0 0 17 17"><path d="M3 2v14h2v-6h3.6l.4 1h6V3H9.5L9 2H3z"></path></svg></a>`;

            // Apply to all instances of same user on page
            sameUserLinks.not('js-userflagstats-loaded').addClass('js-userflagstats-loaded').after(badge);
        });
    }


    function doPageload() {

        // Clear flagger stats cache on weekends
        if(new Date().getDay() % 6 === 0) purgeUserFlagStats();

        let currUid = StackExchange.options.user.userId;

        // If deleted user, do nothing
        if(document.title.indexOf('User deleted') >= 0) return;

        // If on user profile page
        if(/\/users\/\d+\/.*/.test(location.pathname) && (location.search === '' || location.search === '?tab=profile')) {

            // If on own user profile page
            if(location.pathname.indexOf('/users/'+currUid) === 0) {
                currUid = StackExchange.options.user.userId
            }
            // Else must be a mod
            else if(StackExchange.options.user.isModerator) {
                currUid = Number(location.pathname.match(/\d+/)[0]);
            }
            else return;

            getUserFlagStats(currUid).then(function(v) {
                const tier = calculateFlagTier(v[1], v[3]);
                const badge = `<a href="/users/flag-summary/${currUid}" class="flag-badge large ${tier.name}" title="${tier.name} flagger\n${v[1]} flags, ${v[2]} declined (accuracy ${(100 - v[3]).toFixed(2)}%)" target="_blank"><svg aria-hidden="true" class="svg-icon iconFlag" width="17" height="17" viewBox="0 0 17 17"><path d="M3 2v14h2v-6h3.6l.4 1h6V3H9.5L9 2H3z"></path></svg></a>`;
                $("#content .fs-headline2").after(badge);
            });
        }

        // Non-mods, exit
        if(typeof StackExchange == "undefined" || !StackExchange.options || !StackExchange.options.user || !StackExchange.options.user.isModerator ) return;

        // Load user stats on hover
        const userlinks = $('.js-post-flag-group a[href^="/users/"]').on('loadflaggingstats', loadFlaggingFn);

        // Ignore mods
        $('.js-post-flag-group .mod-flair').prev('a').addClass('js-userflagstats-loaded').off('loadflaggingstats');

        // Preprocess userlinks to get the uids
        userlinks.each(function() {
            this.dataset.uid = this.href.match(/-?\d+/)[0];
        });

        // Load user stats on post hover
        $('.js-admin-dashboard').on('mouseover', '.js-flagged-post', function() {
            $('.js-post-flag-group a', this).trigger('loadflaggingstats');
        });

        // Load all flagger stats button
        if(isModPage()) {
            $('<button id="load-flagger-stats" class="fs-body1 s-btn s-btn__filled">Load flagger stats</button>')
                .appendTo('#mainbar-full .fs-body3:first')
                .click(function() {
                    $(this).remove();

                    // unique loads
                    let uids = [];
                    const uniqusers = userlinks.filter(function() {
                        if(!uids.includes(this.dataset.uid)) {
                            uids.push(this.dataset.uid);
                            return true;
                        }
                        return false;
                    })
                    .filter(function() {
                        // ignore those already loaded
                        return !$(this).hasClass('js-userflagstats-loading') && !$(this).hasClass('js-userflagstats-loaded');
                    });

                    // Do nothing if none needs loading
                    if(uniqusers.length === 0) return;

                    // Display progress
                    $('body').showAjaxProgress(uniqusers.length, { position: 'fixed' });

                    // Load each flagger info
                    uniqusers.each(loadFlaggingFn);
                });
        }
    }


    function appendStyles() {

        const styles = `
<style>
#mainbar-full .fs-body3:first-child button {
    margin-top: -2px;
    margin-left: 10px;
}
.flag-badge {
    margin-left: 4px;
    color: var(--black) !important;
}
.flag-badge + .flag-badge {
    display: none;
}
.flag-badge.elite {
    color: var(--green-500) !important;
}
.flag-badge.gold {
    color: var(--gold) !important;
}
.flag-badge.silver {
    color: var(--silver) !important;
}
.flag-badge.bronze {
    color: var(--bronze) !important;
}
.flag-badge.wtf {
    color: var(--red-500) !important;
}
.flag-badge.horrible {
    color: var(--red-400) !important;
}
.flag-badge.hmmm {
    color: var(--red-300) !important;
}
.flag-badge.default path {
    fill: none;
    stroke: var(--black);
    stroke-width: 0.8px;
    stroke-dasharray: 1,1;
    stroke-linejoin: round;
}
.flag-badge.large {
    display: inherit;
    scale: 150%;
}
.flag-badge.default.large path {
   stroke-dasharray: 2,1;
}
</style>
`;
        $('body').append(styles);
    }


    // On page load
    appendStyles();
    doPageload();

})();
