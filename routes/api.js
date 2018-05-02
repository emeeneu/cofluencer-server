const express = require('express');
const upload = require('../helpers/multer');

const router = express.Router();
const FB = require('fb');
const Company = require('../models/company');
const Influencer = require('../models/influencer');
const Campaign = require('../models/campaign');
const Msg = require('../models/msg');

const TwitterPackage = require('twitter');

const secret = {
  consumer_key: 'gnUG9NUN21pUMZ8KzZRIuZQXX',
  consumer_secret: 'Nc0NLEkN9AAOldqX0nLj4SM3MsEW9a8rHbZf8hP8vLk8dSt9sh',
  access_token_key: '343944710-Loy3p1kJKmTEi8gBgMMYKaUWqDTKrcAV2yC9Rzrl',
  access_token_secret: 'GBZc5TG3eOiXl8WaXf5kp995xpASqYZHioZNoZuZKSlIF',
};
const Twitter = new TwitterPackage(secret);

const YouTube = require('youtube-node');
const YouTubeTwo = require('simple-youtube-api');

const youTube = new YouTube();
const youTubeTwo = new YouTubeTwo('AIzaSyApWQSH8w3PpqVTrpu3739e8nDSEQVQC-8');

youTube.setKey('AIzaSyApWQSH8w3PpqVTrpu3739e8nDSEQVQC-8');

router.get('/youtube/:ytId', (req, res) => {
  const { ytId } = req.params;
  youTube.search('', 4, { channelId: ytId }, (error, result) => {
    if (error) {
      res.status(405).json({ error });
    } else {
      // youTube.getById('CZqbkoEMBfU', (err, resu) => {
      //   if (error) {
      //     console.log(err);
      //   } else {
      //     console.log(JSON.stringify(resu, null, 2));
      //   }
      // });
      youTubeTwo.getChannel(`https://www.youtube.com/channel/${ytId}`)
        .then((data) => {
          console.log(data);
        })
        .catch(console.error);
      res.status(200).json({ result });
    }
  });
});

router.put('/youtube/add-account', (req, res) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  const options = {
    new: true,
  };
  const { channelId } = req.body;

  Influencer.findByIdAndUpdate(userId, { 'socialLinks.youtube': channelId }, options)
    .then((updatedUser) => {
      req.session.currentUser = updatedUser;
      res.status(200).json(updatedUser);
    })
    .catch((error) => {
      console.log(error);
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

router.put('/twt/add-account', (req, res) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  const options = {
    new: true,
  };
  const { username } = req.body;

  Influencer.findByIdAndUpdate(userId, { 'socialLinks.twitter': username }, options)
    .then((updatedUser) => {
      req.session.currentUser = updatedUser;
      res.status(200).json(updatedUser);
    })
    .catch((error) => {
      console.log(error);
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
        access_token: 'EAAZAp8OJ3y18BAELry2ZAOW4XGSYAWbiuy9UmrjmkaQ1PMY7tLiGxwWHUjoY3gxxPfg5N5a888ltOvUUcYSulUZBoBAm9IMZBQg5oAcqrmmSRWF1Oo8uymKjngVcK7UKANY8qFtZAV6DmQZBM2txdV3s9myHNN3e4ZD',
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

router.get('/campaigns/:company', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const companyName = req.params.company;
  /* eslint-enable */
  Company.findOne({ username: companyName })
    .then((company) => {
      Campaign.find({ company_id: company.id })
        .populate('company_id')
        .populate('influencer_id')
        .sort({ updated_at: -1 })
        .then(campaigns => res.status(200).json(campaigns))
        .catch(next);
    })
    .catch(next);
});

router.post('/upload-image/:image', upload.single('file'), (req, res, next) => {
  /* eslint-disable */
  const image = req.params.image;
  const userId = req.session.currentUser._id;
  /* eslint-enable */
  const options = {
    new: true,
  };

  if (image === ':coverImage') {
    const updateImage = {
      coverImage: `http://localhost:3000/uploads/${req.file.filename}`,
    };
    if (req.session.currentUser.role === 'influencer') {
      Influencer.findByIdAndUpdate(userId, updateImage, options)
        .then((updatedUser) => {
          req.session.currentUser = updatedUser;
          res.status(200).json(updatedUser);
        })
        .catch(next);
    } else if (req.session.currentUser.role === 'company') {
      Company.findByIdAndUpdate(userId, updateImage, options)
        .then((updatedUser) => {
          req.session.currentUser = updatedUser;
          res.status(200).json(updatedUser);
        })
        .catch(next);
    }
  } else if (image === ':profileImage') {
    const updateImage = {
      profileImage: `http://localhost:3000/uploads/${req.file.filename}`,
    };
    if (req.session.currentUser.role === 'influencer') {
      Influencer.findByIdAndUpdate(userId, updateImage, options)
        .then((updatedUser) => {
          req.session.currentUser = updatedUser;
          res.status(200).json(updatedUser);
        })
        .catch(next);
    } else if (req.session.currentUser.role === 'company') {
      Company.findByIdAndUpdate(userId, updateImage, options)
        .then((updatedUser) => {
          req.session.currentUser = updatedUser;
          res.status(200).json(updatedUser);
        })
        .catch(next);
    }
  }
});

router.put('/update-user', (req, res, next) => {
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
      email: req.body.email,
      name: req.body.name,
      bio: req.body.bio,
      socialLinks: {
        youtube: req.body.socialLinks.youtube,
        twitter: req.body.socialLinks.twitter,
      },
      tags: req.body.tags,
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
      brandName: req.body.brandName,
      email: req.body.email,
      city: req.body.city,
      bio: req.body.bio,
      tags: req.body.tags,
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
    tags: req.body.tags,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });

  return newCampaign.save().then(() => {
    res.json(newCampaign);
  })
    .catch(next);
});

router.delete('/:campaignid/delete-campaign', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  /* eslint-disable */
  const userId = req.session.currentUser._id;
  /* eslint-enable */

  const campaignId = req.params.campaignid;

  Campaign.findByIdAndRemove(campaignId)
    .then(deletedCampaign => res.status(200).json(deletedCampaign))
    .catch(next);
});

router.get('/campaigns/:id', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  Campaign.findById(req.params.id)
    .then(campaign => res.status(200).json(campaign))
    .catch(next);
});

router.get('/list-campaigns', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  Campaign.find()
    .populate('company_id')
    .populate('influencer_id')
    .sort({ create_at: -1 })
    .then((campaigns) => {
      console.log(campaigns[0]);
      res.json(campaigns);
    })
    .catch(next);
});

router.get('/list-my-campaigns', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  Campaign.find({ influencer_id: req.session.currentUser })
    .populate('company_id')
    .populate('influencer_id')
    .sort({ create_at: -1 })
    .then((campaigns) => {
      console.log(campaigns[0]);
      res.json(campaigns);
    })
    .catch(next);
});

router.get('/company/:company', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const company = req.params.company;
  /* eslint-enable */
  Company.findOne({ username: company })
    .then(theCompany => res.status(200).json(theCompany))
    .catch(next);
});

router.put('/campaigns/join/:idCampaign', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  const idCampaign = req.params.idCampaign;
  /* eslint-enable */
  const options = {
    new: true,
  };
  Campaign.findByIdAndUpdate({ _id: idCampaign }, { $push: { influencer_id: userId } }, options)
    .then((updatedCampaign) => {
      res.status(200).json(updatedCampaign);
    })
    .catch(next);
});

router.put('/campaigns/out/:idCampaign', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  /* eslint-disable */
  const userId = req.session.currentUser._id;
  const idCampaign = req.params.idCampaign;
  /* eslint-enable */
  const options = {
    new: true,
  };
  Campaign.findByIdAndUpdate({ _id: idCampaign }, { $pullAll: { influencer_id: [userId] } }, options)
    .then((updatedCampaign) => {
      res.status(200).json(updatedCampaign);
    })
    .catch(next);
});

router.get('/user/me', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { _id, role } = req.session.currentUser;

  if (role === 'influencer') {
    Influencer.findById({ _id }, this.options)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch(next);
  } else if (role === 'company') {
    Company.findById({ _id }, this.options)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch(next);
  }
});

// Messages API

router.post('/send-msg', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { message, to } = req.body;
  const { _id, role } = req.session.currentUser;

  const msgContentFrom = {
    to,
    from: _id,
    msg: message,
    read: true,
    roleTo: role === 'influencer' ? 'Company' : 'Influencer',
    roleFrom: role === 'influencer' ? 'Influencer' : 'Company',
  };

  const msgContentTo = {
    to,
    from: _id,
    msg: message,
    read: false,
    roleTo: role === 'influencer' ? 'Company' : 'Influencer',
    roleFrom: role === 'influencer' ? 'Influencer' : 'Company',
  };

  if (role === 'influencer') {
    Influencer.findByIdAndUpdate({ _id }, { $push: { send: msgContentFrom } }, this.options)
      .then(() => {
        Company.findByIdAndUpdate({ _id: to }, { $push: { messages: msgContentTo } }, this.options)
          .then((updateCompany) => {
            res.status(200).json(updateCompany);
          })
          .catch(next);
      })
      .catch(next);
  } else if (role === 'company') {
    Company.findByIdAndUpdate({ _id }, { $push: { send: msgContentFrom } }, this.options)
      .then(() => {
        Influencer.findByIdAndUpdate({ _id: to }, { $push: { messages: msgContentTo } }, this.options)
          .then((updateCompany) => {
            res.status(200).json(updateCompany);
          })
          .catch(next);
      })
      .catch(next);
  }
});

router.get('/messages/me', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { _id, role } = req.session.currentUser;

  if (role === 'company') {
    Company.findOne({ _id }, { messages: 1, _id: 0 }, this.options)
      .then((userMessages) => {
        // const messagesForMe = userMessages.messages.fiter(msg => msg.from !== _id);
        // console.log(messagesForMe);
        Influencer.populate(userMessages, { path: 'messages.from' })
          .then((messages) => {
            res.status(200).json(messages.messages);
          });
      })
      .catch(next);
  } else if (role === 'influencer') {
    Influencer.findOne({ _id }, { messages: 1, _id: 0 }, this.options)
      .then((userMessages) => {
        Company.populate(userMessages, { path: 'messages.from' })
          .then((messages) => {
            res.status(200).json(messages.messages);
          });
      })
      .catch(next);
  }
});

module.exports = router;
