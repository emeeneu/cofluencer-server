const express = require('express');

const router = express.Router();
const FB = require('fb');
const Company = require('../models/company');
const Influencer = require('../models/influencer');
const Campaign = require('../models/campaign');

const TwitterPackage = require('twitter');

const secret = {
  consumer_key: 'gnUG9NUN21pUMZ8KzZRIuZQXX',
  consumer_secret: 'Nc0NLEkN9AAOldqX0nLj4SM3MsEW9a8rHbZf8hP8vLk8dSt9sh',
  access_token_key: '343944710-Loy3p1kJKmTEi8gBgMMYKaUWqDTKrcAV2yC9Rzrl',
  access_token_secret: 'GBZc5TG3eOiXl8WaXf5kp995xpASqYZHioZNoZuZKSlIF',
};
const Twitter = new TwitterPackage(secret);

const YouTube = require('youtube-node');

const youTube = new YouTube();

youTube.setKey('AIzaSyApWQSH8w3PpqVTrpu3739e8nDSEQVQC-8');

router.get('/youtube/:ytId', (req, res) => {
  const ytId = req.params.ytId;
  youTube.search('', 4, { channelId: ytId }, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.status(200).json({ result });
    }
  });
});

router.get('/private', (req, res) => {
  res.status(200).json({ message: 'Hola estas en la ruta' });
});

router.get('/twt/:twtUserName', (req, res) => {
  const twtUser = req.params.twtUserName;
  Twitter.get('users/search', { q: twtUser }, (error, user) => {
    console.log(user);
    Twitter.get('statuses/user_timeline', { user_id: user[0].id }, (err, tweets) => {
      // console.log(tweets, err);
      res.status(200).json({ user, tweets });
    });
  });
});

// los parametros pasarlos por las ajaxcall!
router.get('/ig/:igUserName', (req, res) => {
  const instaUser = ((igUserName, cb) => {
    FB.api(
      '/1805333172833119',
      {
        fields: `business_discovery.username( ${igUserName} ){username,biography,website,followers_count,media_count,media{caption, comments_count,like_count, media_url, media_type}}`,
        // incluir token en variable actual caduca 13 de abril de 2018.
        access_token: 'EAAapnvGNVhQBAMNo3W7Sjj0K6ufzo4NMZCPBFdeZCyIIuITNHPZAf3sLkHz6zhqAuYyA62fEZBUtBQX2RZCagZC9RVjd6kVu959zLAMgls9b68wG5hPuD3ZClQIvFyxtZAHL3Xbdiis5uoZBheQPVonhvvSus65if2R0YTMg7sG2hKPHTd7OH7VZBJ',
      },
      (igUser) => {
        if (!igUser || igUser.error) {
          console.log(!igUser ? 'error occurred' : igUser.error);
          cb(igUser.error);
        } else {
          cb(null, igUser.business_discovery);
        }
      },
    );
  });
  instaUser(req.params.igUserName, (err, iguser) => {
    res.status(200).json({ iguser });
  });
});

// los parametros pasarlos por las ajaxcall!
router.post('/users/new/:username', (req, res) => {
  Influencer.create({ username: req.params.username }, (user) => {
    res.status(200).json({ user });
  });
});

router.get('/campaigns', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  Campaign.find({ company_id: userId })
    .populate('company_id')
    .populate('influencer_id')
    .sort({ updated_at: -1 })
    .then((campaigns) => {
      res.json(campaigns);
    })
    .catch(next);
});

router.put('/update-company', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  const options = {
    new: true,
  };

  if (req.session.currentUser.role === 'influencer') {
    const updateUser = {
      username: req.body.username,
      bio: req.body.bio,
      socialLinks: {
        youtube: req.body.youtube,
        twitter: req.body.twitter,
      },
    };

    Influencer.findByIdAndUpdate(userId, updateUser, options)
      .then((updatedUser) => {
        req.session.currentUser = updatedUser;
        res.status(200).json(updatedUser);
      })
      .catch(next);
  } else if (req.session.currentUser.role === 'company') {
    const updateUser = {
      username: req.body.username,
      bio: req.body.bio,
    };

    Company.findByIdAndUpdate(userId, updateUser, options)
      .then((updatedUser) => {
        req.session.currentUser = updatedUser;
        res.status(200).json(updatedUser);
      })
      .catch(next);
  }
});

router.put('/:campaignid/update-campaign', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  const options = {
    new: true,
  };

  const campaignId = req.params.campaignid;

  const updateCampaign = {
    title: req.body.title,
    description: req.body.description,
  };

  Campaign.findByIdAndUpdate(campaignId, updateCampaign, options)
    .then((updatedCampaign) => {
      res.status(200).json(updatedCampaign);
    })
    .catch(next);
});

router.post('/newcampaign', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const newCampaign = Campaign({
    /* eslint-disable */
    company_id: req.session.currentUser._id, 
    /* eslint-enable */
    title: req.body.title,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });

  return newCampaign.save().then(() => {
    res.json(newCampaign);
  })
    .catch(next);
});

router.get('/campaigns/:id', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  Campaign.findById(req.params.id)
    .then((campaign) => {
      return res.status(200).json(campaign);
    })
    .catch(next);
});

module.exports = router;
