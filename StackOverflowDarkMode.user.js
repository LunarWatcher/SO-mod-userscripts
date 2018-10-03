// ==UserScript==
// @name         Stack Overflow Dark Mode
// @description  Dark theme for Stack Overflow
// @homepage     https://github.com/samliew/SO-mod-userscripts
// @author       @samliew
// @version      1.0.8
//
// @include      https://*stackoverflow.com/*
//
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';


    const textcolor = '#ccc';
    const bgcolor = '#222';
    const btncolor = '#333';
    const bordercolor = '#555';


    GM_addStyle(`


/* Apply to all */
*,
*:before,
*:after,
#search-channel-selector,
body .bg-black-025,
body .bg-black-050,
.fc-light,
.fc-medium,
.fc-dark {
    background-color: ${bgcolor};
    color: ${textcolor};
    border-color: ${bordercolor};
    box-shadow: none;
    outline: none
}
#sidebar .community-bulletin .bulletin-item-content a,
a {
    color: #eee;
    border-bottom: 1px dashed inherit;
}
#sidebar .community-bulletin .bulletin-item-content a:hover,
a:hover {
    color: #fff;
    border-bottom-color: white;
}
iframe:hover,
a:hover img,
a:hover svg,
button:hover img,
button:hover svg {
    filter: none;
    background-color: inherit;
}
iframe,
img,
.-img,
._glyph {
    filter: brightness(0.8) saturate(90%);
}
button:hover,
input[type="button"]:hover,
input[type="submit"]:hover,
.s-btn:hover, .btn:hover {
    background-color: ${btncolor};
    color: white;
}


/* Selection */
::selection { background: #408050; }
::-moz-selection { background: #408050; }


/* Scrollbars */
::-webkit-scrollbar{ width:10px; height:10px; }
::-webkit-scrollbar-thumb{ background-color:rgb(196, 196, 196); border-radius: 5; }
::-webkit-scrollbar-thumb:hover{ background-color:rgb(196, 196, 196); }
::-webkit-scrollbar-track{ background-color:rgb(60, 60, 60); }


/* Specific elements opacity & hover */
.wmd-button-row,
#left-sidebar,
#sidebar > *,
.deleted-answer,
.downvoted-answer,
.top-bar .-logo {
    opacity: 0.6;
    transition: opacity 0.2s ease;
}
.question-summary .started,
#footer > div {
    opacity: 0.4;
    transition: opacity 0.2s ease;
}
ul.comments-list .comment-voting,
ul.comments-list .comment-flagging {
    opacity: 0.1;
}
.wmd-button-row:hover,
#left-sidebar:hover,
#sidebar > *:hover,
.deleted-answer:hover,
.downvoted-answer:hover,
.top-bar .-logo:hover,
.question-summary:hover .started,
#footer:hover > div,
ul.comments-list .comment:hover .comment-voting,
ul.comments-list .comment:hover .comment-flagging {
    opacity: 1;
}


/* Specific elements */
#sidebar a,
#content #sidebar .community-bulletin .bulletin-item-content a,
a.fc-medium,
a.fc-dark {
    color: inherit;
}
#sidebar a:hover,
#content #sidebar .community-bulletin .bulletin-item-content a:hover,
a.fc-medium:hover,
a.fc-dark:hover {
    color: white;
}
#content {
    border-right: none;
}
#footer {
    border-top: 1px solid ${bordercolor};
}
#tabs a:before,
.tabs a:before {
    background: transparent;
}
.top-bar .-logo,
.top-bar .-logo span {
    background-color: white;
    filter: none;
}
.f-select:before, .f-select:after {
    border-color: #bbb transparent;
}
.s-btn__muted.s-btn__outlined.s-btn__dropdown:after {
    border-color: currentColor transparent;
}
.temp-popover--arrow:before,
.temp-popover--arrow:after {
    border-color: transparent;
    border-bottom-color: #e4e6e8;
}
.top-bar .indicator-badge {
    background-color: #07C;
    color: white;
}
.top-bar .indicator-badge._important {
    background-color: #C91D2E;
}
ul.comments-list .comment > * {
    border-color: #333;
}
.comment .relativetime,
.comment .relativetime-clean,
.comment .comment-score {
    opacity: 0.5;
}
.message {
    border: 1px solid ${bordercolor};
}
.wmd-button-row {
    background-color: white;
}
.wmd-button-row * {
    background-color: inherit;
}
.js-post-issues .s-btn {
    border-color: transparent;
}
.question-summary .excerpt {
    color: #aaa;
}
.post-tag,
.tags .post-tag,
.post-taglist .post-tag {
    background-color: ${btncolor};
    color: #aaa;
}
body > div[style*="absolute"],
.tag-popup {
    background-color: transparent;
}
.tag-popup .-container,
.tag-popup .-container > * {
    background-color: black;
}
.s-progress {
    background-color: #d6d9dc;
}
.s-progress--bar {
    background-color: #42d773;
}
a.youarehere {
    background-color: ${bordercolor};
}
.bounty-indicator-tab {
    color: white;
    background-color: #0077dd;
}
.supernovabg {
    background-color: #F48024;
}
.hotbg {
    background-color: #CF7721;
}
.coolbg {
    background-color: #9199a1;
}
.tagged-interesting {
    box-shadow: inset 0 0 20px 0px #fffbec;
}
.deleted-answer {
    box-shadow: inset 0 0 0 9999px #220000;
}
.tagged-interesting *,
.deleted-answer * {
    background-color: transparent;
}
.vote-up-off,
.vote-down-off,
.star-off {
    opacity: 0.2;
}
.vote-up-on,
.vote-down-on {
    background-blend-mode: exclusion;
    filter: brightness(1000%);
    background-color: #030303;
    opacity: 1;
}
.star-on {
    opacity: 1;
}
.new-post-activity,
.new-answer-activity {
    background-color: #888;
}
.new-post-activity a,
.new-answer-activity a {
    background-color: transparent;
}
.answer-votes.answered-accepted {
    color: white;
    background-color: #5fba7d;
}
span.diff-delete {
    background-color: #e5bdb2;
    color: #a82400;
}
span.diff-add {
    background-color: #d1e1ad;
    color: #405a04;
}
img.diff-delete {
    border-color: red;
}
img.diff-add {
    border-color: #d1e1ad;
}
.inserted > div {
    background-color: #204a2e;
}
.profile-cards--graph {
    background-image: none;
}
a.comment-user.owner {
    background-color: #E1ECF4;
    color: #555;
}


/* Code colours */
pre {
    background-color: #444;
}
pre * {
    background-color: inherit;
}
.str, .lit, .tag {
    color: #d68585;
}
.kwd, .dec {
    color: #7e7ef1;
}
.typ {
    color: #6dbcd5;
}


/* Dark mode for SOMU userscripts */
.js-usercolor:after {
    opacity: 0.7;
}
.post-stickyheader {
    background: #111;
}
.ctype-custom,
.ctype-bad,
.ctype-poor,
.ctype-meh {
    display: inline;
    padding: 2px 5px 3px;
    line-height: 1;
    font-size: 10px;
    font-style: normal;
    border-radius: 2px;
    color: white;
}
.ctype-custom {
    background-color: #ffc;
}
.ctype-bad {
    background-color: #ff2600;
}
.ctype-poor {
    background-color: #ff9300;
}
.ctype-meh {
    background-color: #999;
}
.delete-comment,
.cancel-comment-flag,
.skip-post {
    background: #444;
}
.cancel-comment-flag .cancel-delete-comment-flag {
    background-color: red;
}


`.replace(/;/g, ' !important;'));

})();