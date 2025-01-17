const db = require('../database/dbConfig');

const CampUpdate = require('../campaignUpdates/updateModel.js');
const CampComments = require('../comments/commentsModel.js');
const CampLikes = require('../social/socialModel.js');

module.exports = {
  find,
  findCampaign,
  findById,
  findUser,
  findCampByUserId,
  insert,
  remove,
  update
};

function find() {
  return db('campaigns')
    .join('users', 'users.id', 'campaigns.users_id')
    .select(
      'users.username',
      'users.profile_image',
      'users.location',
      'campaigns.*'
    )
    .then(campaigns => {
      return db('likes').then(likes => {
        campaigns.map(cam => {
          return (cam.likes = likes.filter(
            like => like.camp_id === cam.camp_id
          ));
        });
        return campaigns;
      });
    })
    .then(campaigns => {
      return db('comments')
        .join('users', 'users.id', 'comments.users_id')
        .select(`comments.*`, 'users.profile_image', 'users.username')
        .then(comments => {
          campaigns.map(cam => {
            return (cam.comments = comments.filter(
              com => com.camp_id === cam.camp_id
            ));
          });
          return campaigns;
        });
    });
}

function findCampaign(camp_id) {
  return db('campaigns')
    .where({ camp_id })
    .first();
}

async function findById(camp_id) {
  const campaign = await db('campaigns')
    .where({ camp_id })
    .join('users', 'users.id', 'campaigns.users_id')
    .select(
      'users.username',
      'users.profile_image',
      'users.location',
      'campaigns.*'
    )
    .first();
  campaign.updates = await CampUpdate.findUpdatesByCamp(camp_id);
  campaign.comments = await CampComments.findCampaignComments(camp_id);
  campaign.likes = await CampLikes.findCampaignLikes(camp_id);
  return campaign;
}

function findUser(id) {
  return db('users')
    .where({ id })
    .first();
}

async function findCampByUserId(users_id) {
  const campaigns = await db('campaigns')
    .where({ users_id: users_id })
    .join('users', 'users.id', 'campaigns.users_id')
    .select(
      'users.username',
      'users.profile_image',
      'users.location',
      'campaigns.*'
    );
  const withUpdates = campaigns.map(async camp => {
    camp.updates = await CampUpdate.findUpdatesByCamp(camp.camp_id);
    camp.comments = await CampComments.findCampaignComments(camp.camp_id);
    camp.likes = await CampLikes.findCampaignLikes(camp.camp_id);
    return camp;
  });
  const result = await Promise.all(withUpdates);
  return result;
}

async function insert(campaign) {
  const [camp_id] = await db('campaigns')
    .insert(campaign)
    .returning('camp_id');
  if (camp_id) {
    const camp = await findById(camp_id);
    return camp;
  }
}

async function update(campaign, camp_id) {
  const editedCamp = await db('campaigns')
    .where({ camp_id })
    .update(campaign);
  if (editedCamp) {
    const camp = await findById(camp_id);
    return camp;
  }
}

async function remove(camp_id) {
  const deleted = await db('campaigns')
    .where({ camp_id })
    .del();
  if (deleted) {
    return camp_id;
  } else {
    return 0;
  }
}
