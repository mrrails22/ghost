/**
 * Main JS file for Scriptor behaviours
 */

/*globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function(){
        // Responsive video embeds
        $('.entry-content').fitVids();

        // Navigation
        $('#menu-toggle').click(function(){
            var menuToggle = $(this),
                menu = $('.nav-menu');            
            if ( menuToggle.hasClass('icon-close') ) {
                menu.slideUp();
                menuToggle.removeClass('icon-close').addClass('icon-navicon');
            } else {
                menu.slideDown();
                menuToggle.addClass('icon-close').removeClass('icon-navicon');
            }
        });
        $(window).bind('resize orientationchange', function() {
            if ( $('#menu-toggle').is(':hidden') ) {
                $('#menu-toggle').removeClass('icon-close').addClass('icon-navicon');
                $('.nav-menu').removeAttr('style');
            }
        });

        // Scroll to top
        $('.site-footer .top-link').on('click', function(e) {
            $('html, body').animate({'scrollTop': 0});
            e.preventDefault();
        });

        // Display recent posts and tagcloud
        if ( $('.recent-posts').length || $('.tagcloud').length ) {
            parseRss();
        }
   
    });

    /* Inspired by Ghost Related plugin (https://github.com/danecando/jquery.ghostrelated) */
    function parseRss(pageNum, prevId, feeds) {
        var page = pageNum || 1,
            prevId = prevId || '',
            feeds = feeds || [];
        $.ajax({
            url: '/rss/' + page + '/',
            type: 'GET',
            success: function(data){
                var curId = $(data).find('item > guid').text();
                if (curId != prevId) {
                    feeds.push(data);
                    parseRss(page+1, curId, feeds);
                } else {
                    var posts = getPosts(feeds);
                    displayRecentPosts(posts);
                    displayTagCloud(posts);
                }
            },
            complete: function(xhr) {
                if (xhr.status == 404) {
                    var posts = getPosts(feeds);
                    displayRecentPosts(posts);
                    displayTagCloud(posts);
                }
            }
        });
    }

    function getPosts(feeds) {
        var posts = [],
            items = [];
        feeds.forEach(function(feed) {
            items = $.merge(items, $(feed).find('item'));
        });
        for (var i = 0; i < items.length; i++) {
            var item = $(items[i]);
            posts.push({
                title: item.find('title').text(),
                url: item.find('link').text(),
                date: item.find('pubDate').text(),
                tags: $.map(item.find('category'), function(elem) {
                    return $(elem).text();
                })
            });
        }
        return posts;
    }

    function displayRecentPosts(posts) {
        var count = 0,
            posts_count = typeof latest_posts_count !== 'undefined' ? latest_posts_count : 5;
        posts.forEach(function(post) {
            if ( count < posts_count ) {
                $('.recent-posts').append($('<div class="recent-item"><a href="' + post.url + '">' + post.title + '</a><span>' + formatDate(post.date) + '</span></div>'));
            }
            count++;
        });
    }

    function formatDate(postDate) {
        var months = Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
            date = new Date(postDate),
            dateString = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        return dateString;
    }

    function displayTagCloud(posts) {
        var tagList = [],
            tagCloud = '';
        posts.forEach(function(post) {
            var tags = post.tags;
            tags.forEach(function(tag) {
                if ( $.inArray(tag, tagList) == -1 ) {
                    tagList.push(tag);
                }
            });
        });
        for ( var i=0; i<tagList.length; i++ ) {
            var tag = tagList[i],
            tagLink = tag.replace(/\s+/g, '-').toLowerCase();
            tagCloud += ('<a href="/tag/' + tagLink + '" class="fill-horizontal">' + tag + '</a>');
        }
        $('.tagcloud').append(tagCloud);
    }
    
}(jQuery));