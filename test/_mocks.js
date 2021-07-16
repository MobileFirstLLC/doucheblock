export default class MockMutationObserver {
    observe() {
    }
}

export class MockXHR {

    constructor() {
        this.response = undefined;
    }

    get response() {
        return JSON.stringify(this.__response);
    }

    get status() {
        return 200;
    }

    set response(value) {
        this.__response = value;
    }

    get readyState() {
        return 4;
    }

    set onload(callback) {
        this.__callback = callback;
    }

    setRequestHeader() {
    }

    send() {
        this.__callback();
    }

    open(method, url) {
        if (url.indexOf('screen_name=error') > 0) {
            this.__response = undefined;
        }
        if (url.indexOf('screen_name=jack') > 0) {
            this.__response = MockResponses.bio;
        }
        if (url.indexOf('UserByScreenNameWithoutResults') > 0) {
            this.__response = MockResponses.friendship;
        }
    }
}

const MockResponses = {
    bio: [{
        'id': 12,
        'id_str': '12',
        'name': 'jack',
        'screen_name': 'jack',
        'location': '',
        'description': '#bitcoin',
        'url': null,
        'entities': {'description': {'urls': []}},
        'protected': false,
        'followers_count': 5578267,
        'fast_followers_count': 0,
        'normal_followers_count': 5578267,
        'friends_count': 4776,
        'listed_count': 29677,
        'created_at': 'Tue Mar 21 20:50:14 +0000 2006',
        'favourites_count': 34517,
        'utc_offset': null,
        'time_zone': null,
        'geo_enabled': true,
        'verified': true,
        'statuses_count': 27650,
        'media_count': 2834,
        'lang': null,
        'contributors_enabled': false,
        'is_translator': false,
        'is_translation_enabled': false,
        'profile_background_color': 'EBEBEB',
        'profile_background_image_url': 'http:\/\/abs.twimg.com\/images\/themes\/theme7\/bg.gif',
        'profile_background_image_url_https': 'https:\/\/abs.twimg.com\/images\/themes\/theme7\/bg.gif',
        'profile_background_tile': false,
        'profile_image_url': 'http:\/\/pbs.twimg.com\/profile_images\/1115644092329758721\/AFjOr-K8_normal.jpg',
        'profile_image_url_https': 'https:\/\/pbs.twimg.com\/profile_images\/1115644092329758721\/AFjOr-K8_normal.jpg',
        'profile_banner_url': 'https:\/\/pbs.twimg.com\/profile_banners\/12\/1584998840',
        'profile_link_color': '990000',
        'profile_sidebar_border_color': 'DFDFDF',
        'profile_sidebar_fill_color': 'F3F3F3',
        'profile_text_color': '333333',
        'profile_use_background_image': true,
        'has_extended_profile': true,
        'default_profile': false,
        'default_profile_image': false,
        'pinned_tweet_ids': [1247616214769086465],
        'pinned_tweet_ids_str': ['1247616214769086465'],
        'has_custom_timelines': true,
        'following': null,
        'follow_request_sent': null,
        'notifications': null,
        'advertiser_account_type': 'promotable_user',
        'advertiser_account_service_levels': [],
        'business_profile_state': 'none',
        'translator_type': 'regular',
        'withheld_in_countries': [],
        'require_some_consent': false
    }],
    friendship: {
        'data': {
            'user': {
                'id': 'VXNlcjoxMTA4NzI0OTcw',
                'rest_id': '1108724970',
                'affiliates_highlighted_label': {},
                'legacy': {
                    'blocked_by': false,
                    'blocking': true,
                    'can_dm': true,
                    'can_media_tag': true,
                    'created_at': 'Mon Jan 21 11:03:28 +0000 2013',
                    'default_profile': false,
                    'default_profile_image': false,
                    'description': 'Passion led us here. Pack of 220.  \n#MicrosoftFlightSimulator ✈️ #APlagueTale \uD83D\uDC00\uD83D\uDD25',
                    'entities': {
                        'description': {'urls': []},
                        'url': {
                            'urls': [{
                                'display_url': 'asobostudio.com',
                                'expanded_url': 'http://www.asobostudio.com',
                                'url': 'https://t.co/4TFYPQGXEm',
                                'indices': [0, 23]
                            }]
                        }
                    },
                    'fast_followers_count': 0,
                    'favourites_count': 14951,
                    'follow_request_sent': false,
                    'followed_by': false,
                    'followers_count': 29534,
                    'following': false,
                    'friends_count': 486,
                    'has_custom_timelines': true,
                    'is_translator': false,
                    'listed_count': 276,
                    'location': 'Bordeaux France',
                    'media_count': 738,
                    'muting': false,
                    'name': 'Asobo Studio ✈️\uD83D\uDC00',
                    'normal_followers_count': 29534,
                    'notifications': false,
                    'pinned_tweet_ids_str': ['1404379811280265218'],
                    'profile_banner_extensions': {
                        'mediaColor': {
                            'r': {
                                'ok': {
                                    'palette': [{
                                        'percentage': 94.62,
                                        'rgb': {'blue': 13, 'green': 13, 'red': 15}
                                    }, {
                                        'percentage': 4.49,
                                        'rgb': {'blue': 110, 'green': 126, 'red': 148}
                                    }, {
                                        'percentage': 0.4,
                                        'rgb': {'blue': 31, 'green': 49, 'red': 77}
                                    }, {
                                        'percentage': 0.29,
                                        'rgb': {'blue': 217, 'green': 223, 'red': 224}
                                    }, {'percentage': 0.13, 'rgb': {'blue': 106, 'green': 119, 'red': 165}}]
                                }
                            }
                        }
                    },
                    'profile_banner_url': 'https://pbs.twimg.com/profile_banners/1108724970/1624003586',
                    'profile_image_extensions': {
                        'mediaColor': {
                            'r': {
                                'ok': {
                                    'palette': [{
                                        'percentage': 91.1,
                                        'rgb': {'blue': 255, 'green': 255, 'red': 255}
                                    }, {'percentage': 7.75, 'rgb': {'blue': 1, 'green': 1, 'red': 1}}]
                                }
                            }
                        }
                    },
                    'profile_image_url_https': 'https://pbs.twimg.com/profile_images/1333771567906631680/JwdIbhBq_normal.jpg',
                    'profile_interstitial_type': '',
                    'protected': false,
                    'screen_name': 'AsoboStudio',
                    'statuses_count': 3488,
                    'translator_type': 'none',
                    'url': 'https://t.co/4TFYPQGXEm',
                    'verified': true,
                    'want_retweets': false,
                    'withheld_in_countries': []
                },
                'legacy_extended_profile': {},
                'is_profile_translatable': false
            }
        }
    }
};
