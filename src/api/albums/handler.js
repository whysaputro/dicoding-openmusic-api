const concatenateSongsToAlbumModel = require('../../utils/model/AlbumModel');
const { successResponse } = require('../../utils/responses');

class AlbumsHandler {
  constructor({ albumsService, songsService }, validator) {
    this._albumService = albumsService;
    this._songService = songsService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const albumId = await this._albumService.addAlbum(name, year);

    return successResponse(h, {
      responseData: {
        albumId,
      },
      responseCode: 201,
    });
  }

  async getAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const album = await this._albumService.getAlbumById(albumId);
    const songs = await this._songService.getSongByAlbumId(albumId);

    return successResponse(h, {
      responseData: {
        album: concatenateSongsToAlbumModel(album, songs),
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id: albumId } = request.params;
    const { name, year } = request.payload;

    await this._albumService.editAlbumById(albumId, name, year);

    return successResponse(h, {
      responseMessage: 'Album berhasil diperbarui',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    await this._albumService.deleteAlbumById(albumId);

    return successResponse(h, {
      responseMessage: 'Album berhasil dihapus',
    });
  }
}

module.exports = AlbumsHandler;
