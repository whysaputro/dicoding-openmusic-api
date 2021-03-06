const { successResponse } = require('../../utils/responses');

class CollaborationsHandler {
  constructor({ collaborationsService, playlistsService, usersService }, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    this._validator.validateCollaboration(request.payload);
    await this._usersService.verifyUserAvaibility(userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

    return successResponse(h, {
      responseData: {
        collaborationId,
      },
      responseCode: 201,
    });
  }

  async deleteCollaborationHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    this._validator.validateCollaboration(request.payload);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return successResponse(h, {
      responseMessage: 'Kolaborasi berhasil dihapus',
    });
  }
}

module.exports = CollaborationsHandler;
