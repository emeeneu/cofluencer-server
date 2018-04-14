const express = require('express');

const router = express.Router();
const FB = require('fb');
const Company = require('../models/company');
const Influencer = require('../models/influencer');
const Campaign = require('../models/campaign');

router.get('/private', (req, res) => {
  res.status(200).json({ message: 'Hola estas en la ruta' });
});

// los parametros pasarlos por las ajaxcall!
router.get('/ig/:igUserName', (req, res) => {
  const instaUser = ((igUserName, cb) => {
    FB.api(
      '/17841407080190618',
      {
        fields: `business_discovery.username( ${igUserName} ){username,biography,website,followers_count,media_count,media{caption, comments_count,like_count, media_url, media_type}}`,
        // incluir token en variable actual caduca 13 de abril de 2018.
        access_token: 'EAAZAp8OJ3y18BAHuvZC4e8xPE3nSPxxQCpNelq8urrk2BvfIAbAD5ANFZAcrYlwOgFGTBznfhQmBe9h9jZB6cbiADZCb2uWKqO1quJI0LIXpZCOWayBydvtiZBcPH92hFlaDjqwCA12hMTEjqZAZCOTAIo2Akg1cZAvueI0drUr3yUPBOGCbnTH9Az0r5N1kGZASHgZD',
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

router.put('/updateUser', (req, res, next) => {
  console.log('user: ', req.body);
  if (req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */

  const updateUser = {
    username: req.body.username,
    bio: req.body.bio,
  };

  Company.findByIdAndUpdate(userId, updateUser)
    .then((updatedCompany) => {
      res.json(updatedCompany);
      console.log(updatedCompany);
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

module.exports = router;
