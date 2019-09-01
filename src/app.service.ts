import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AppRepository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  async register(user: IUser) {
    // найдем людей с таким же логином
    // если занят, то ошибка
    const found = await this.appRepository.getUserByLogin(user.login);
    if (found) {
      throw new BadRequestException('login already exists');
    }

    // если логин свободен, то ок, сохраним
    await this.appRepository.saveUser(user);
  }

  createId(login: string): string {
    return `${Date.now()}.${login}.${Date.now()}`;
  }

  async login(user: IUser) {
    // найти юзера по логину и паролю
    const found = await this.appRepository.getUser(user);
    if (!found) {
      throw new NotFoundException('not found');
    }
    // если найден, присвоить уникальный идентификатор 
    const id = this.createId(user.login);
    await this.appRepository.saveId(user.login, id);
    return id;
    // и вернуть его
  }

  generateLink() {
    return `http://localhost:3001/${Date.now()}`;
  }

  async createLink(data: ICreateLink) {
    await this.appRepository.idExists(data.id);

    // проверить есть ли такой id
    const idExists = await this.appRepository.idExists(data.id);
    if (!idExists) {
      throw new ForbiddenException('id not exists');
    }
    // если такой id есть, то ок, иначе ошибка

    const link = this.generateLink();
    await this.appRepository.saveLink(data.url, link);

    return link;
  }

  async getLongLink(linkId: string): Promise<string> {
    const link = `http://localhost:3001/${linkId}`;
    const longLink = await this.appRepository.findLongLink(link);
    if (!longLink) {
      throw new NotFoundException('Incorrect link');
    }
    return longLink;
  }

  async getCodeMessage(code: Code): Promise<void> {
      const isBusy = await this.appRepository.checkId(code.login);
      if (isBusy) {
        await this.appRepository.getMessage(code);
      }
      else throw new NotFoundException('not found');
  }
  async sendCodeMessage(): Promise<Code[]> {
   return this.appRepository.sendMessage();
  }
  async getLogin(login: string): Promise<boolean> {
    return await this.appRepository.checkId(login);
  }
}

interface ICreateLink {
  url: string;
  id: string;
}

interface Code {
  login:string;
  message:string;
}

// copy-paste
// TODO: move to file
interface IUser {
  login: string;
  password: string;
}