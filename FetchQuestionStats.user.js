// ==UserScript==
// @name         Fetch Question Stats
// @description  Display number of comments on each post in question lists. For mod queues, additional info (recent revision history) is also retrieved.
// @homepage     https://github.com/samliew/SO-mod-userscripts
// @author       @samliew
// @version      2.1
//
// @include      https://*stackoverflow.com/*
// @include      https://*serverfault.com/*
// @include      https://*superuser.com/*
// @include      https://*askubuntu.com/*
// @include      https://*mathoverflow.net/*
// @include      https://*.stackexchange.com/*
//
// @exclude      *chat.*
// @exclude      https://stackoverflow.com/c/*
// ==/UserScript==

/* globals StackExchange, GM_info */

'use strict';

const fkey = StackExchange.options.user.fkey;
const apikey = 'XpzQT9bIKj6zl5)ctj7j)w((';
const apikey2 = '40LgmwObbfMGyfKA92qegg((';
const apikey3 = 'UYh5TKTIPsesM0TNjKOvCQ((';
const timestampAt = daysago => Math.floor(new Date(Date.now() - daysago * 24 * 60 * 60 * 1000) / 1000);


// Get comments for posts
function getPostComments(arrPids, daysago = 30) {
    return new Promise(function (resolve, reject) {
        if (typeof arrPids === 'undefined' || arrPids === null || arrPids.length == 0) { reject(); return; }

        $.get(`https://api.stackexchange.com/2.2/posts/${arrPids.join(';')}/comments?pagesize=100&fromdate=${timestampAt(daysago)}&order=desc&sort=creation&site=${location.hostname}&filter=!*JxbCg3rl-(BR7.w&key=${apikey}`)
            .done(function (data) {
                resolve(data.items);
                return;
            })
            .fail(reject);
    });
}

// Get revisions for posts (including first rev)
function getPostRevisions(arrPids, daysago = 30) {
    return new Promise(function (resolve, reject) {
        if (typeof arrPids === 'undefined' || arrPids === null || arrPids.length == 0) { reject(); return; }

        $.get(`https://api.stackexchange.com/2.2/posts/${arrPids.join(';')}/revisions?pagesize=100&fromdate=${timestampAt(daysago)}&site=${location.hostname}&filter=!SWJaJDLw60c6cEGmKi&key=${apikey2}`)
            .done(function (data) {
                resolve(data.items);
                return;
            })
            .fail(reject);
    });
}

// Get accepted status for answers
function getAcceptStatus(arrPids) {
    return new Promise(function (resolve, reject) {
        if (typeof arrPids === 'undefined' || arrPids === null || arrPids.length == 0) { reject(); return; }

        $.get(`https://api.stackexchange.com/2.2/answers/${arrPids.join(';')}?pagesize=50&site=${location.hostname}&filter=!9eVtBsbS*&key=${apikey3}`)
            .done(function (data) {
                resolve(data.items);
                return;
            })
            .fail(reject);
    });
}


function doPageLoad() {

    // Append statscontainer to posts in mod queues
    $('.flagged-posts .flagged-post-row .post-summary').append(`<div class="statscontainer"></div>`);

    const modonly = location.pathname.includes('/admin/dashboard');
    const questions = $('#questions .question-summary, .flagged-posts .flagged-post-row, .search-result');
    const pids = questions.map((i, el) => el.id.replace(/\D+/g, '')).get();

    if (pids.length == 0) return;

    getPostComments(pids).then(function (comments) {
        questions.each(function () {
            const pid = Number(this.id.replace(/\D+/g, ''));
            const cmmts = comments.filter(v => v.post_id === pid);
            $(this).find('.statscontainer').append(modonly ?
                `<div class="views" title="${cmmts.length} recent comments"><a href="https://${location.hostname}/a/${pid}" target="_blank">${cmmts.length} recent comments<a/></div>` :
                `<div class="views" title="${cmmts.length} recent comments">${cmmts.length} cmmts</div>`);
        });
    }).finally(function () {
        if (!modonly) return;

        // If mod queue, also load revisions
        getPostRevisions(pids).then(function (revisions) {
            questions.each(function () {
                const flagDates = $(this).find('.mod-message .relativetime').map((i, el) => new Date(el.title).getTime() / 1000).sort();
                const pid = Number(this.id.replace(/\D+/g, ''));
                const revs = revisions.filter(v => v.post_id === pid).filter(v => v.comment && v.comment.includes('Post Undeleted') == false);
                const revsSinceFlag = revs.filter(v => v.creation_date > flagDates[0]);
                const statsContainer = $(this).find('.statscontainer');

                if (revsSinceFlag.length > 0) {
                    statsContainer.append(`<div class="views warning"><a href="https://${location.hostname}/posts/${pid}/revisions" target="_blank" title="view revisions">modified ${revsSinceFlag.length} times since flagged</a></div>`);
                }
                else {
                    statsContainer.append(`<div class="views"><a href="https://${location.hostname}/posts/${pid}/revisions" target="_blank" title="view revisions">${revs.length} recent revisions</a></div>`);
                }
            });

        }).finally(function () {
            questions.each(function () {
                const pid = Number(this.id.replace(/\D+/g, ''));
                const flagCount = $(this).find('.bounty-indicator-tab').hide().map((i, el) => Number(el.innerText)).get().reduce((a, c) => a + c);
                const statsContainer = $(this).find('.statscontainer');
                statsContainer.append(`<div><a href="https://${location.hostname}/posts/${pid}/timeline?filter=flags" target="_blank" title="view post timeline">${flagCount} flags</a></div>`);
            });
        });

        // If mod queue, also load accept status for answers
        const answers = $('.flagged-posts .answer-hyperlink').parents('.flagged-posts .flagged-post-row');
        const pids2 = answers.map((i, el) => el.id.replace(/\D+/g, '')).get();
        getAcceptStatus(pids2).then(function (posts) {
            let acceptedPosts = posts.filter(o => o.is_accepted).map(o => o.answer_id);
            answers.each(function () {
                const pid = Number(this.id.replace(/\D+/g, ''));
                if (acceptedPosts.includes(pid)) {
                    $(this).find('.statscontainer').before(`<span class="vote-accepted-on" title="accepted answer">accepted</span>`);
                }
            });
        });
    });
}


// On page load
doPageLoad();


// Append styles
const styles = document.createElement('style');
styles.setAttribute('data-somu', GM_info?.script.name);
styles.innerHTML = `
.statscontainer .views {
    color: #6a737c;
    font-size: 11px;
}
.flagged-post-row .statscontainer {
    display: inline-flex;
    justify-content: space-between;
    min-width: 100%;
    margin: 10px 0 -10px;
    padding: 8px 10px;
    border: 1px solid var(--black-050);
    font-size: inherit;
}
.flagged-post-row .statscontainer > div {
    width: auto;
    padding: 0;
    line-height: 1.3;
    text-align: left;
    color: #333;
}
.flagged-post-row .statscontainer > div:last-child {
    margin-bottom: 0;
}
.flagged-post-row .statscontainer a {
    color: inherit;
}
.flagged-post-row .statscontainer .views {
    font-size: inherit;
}
.flagged-post-row .statscontainer .warning {
    color: var(--red-500);
}
.flagged-post-row .statscontainer .warning a {
    font-weight: bold;
}
.post-summary .vote-accepted-on {
    display: inline-block;
}
.tagged-ignored {
    opacity: 0.5;
}
`;
document.body.appendChild(styles);