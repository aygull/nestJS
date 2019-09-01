import { Injectable } from "@nestjs/common";
import { IncomingMessage } from 'http';
import { async } from 'rxjs/internal/scheduler/async';

const fs = require('fs');

async function writeFile() {
  // TODO:
}

@Injectable()
export class AppRepository {
  private users: IUser[] = [];
  private messages: Code[] = [];
  private readonly loginToId: Map<string, string> = new Map();
  private readonly shortLinkToLong: Map<string, string> = new Map();

  constructor() {
    const onRead = function(err, data) {
      const parsedData = JSON.parse(data);
      this.users = parsedData;
    };
    fs.readFile("save.json", onRead.bind(this));
    // fs.readFile("save.json", (err, data) => (this.users = JSON.parse(data)));
    fs.readFile("savecode.json", (err, data) => (this.messages = JSON.parse(data)));
  }

  async getUserByLogin(login: string): Promise<IUser | undefined> {
    return this.users.find(user => user.login === login);
  }

  async getUser(user: IUser): Promise<IUser | undefined> {
    return this.users.find(userData => {
      return (user.login === userData.login) && (user.password === userData.password);
    });
  }
  async getMessage(message: Code): Promise<void> {
    this.messages.push(message);
    fs.writeFile("savecode.json", JSON.stringify(this.messages));
  }
  async sendMessage(): Promise<Code[]> {
    return this.messages;
  }
  async saveUser(user: IUser): Promise<void> {
    this.users.push(user);
    fs.writeFile("save.json", JSON.stringify(this.users));
  }

  async saveId(login: string, id: string): Promise<void> {
    this.loginToId.set(login, id);
  }

  async idExists(id: string): Promise<boolean> {
    const values = Array.from(this.loginToId.values());
    return values.includes(id);
  }
  async checkId(login: string): Promise<boolean> {
    const values = Array.from(this.loginToId.keys());
    return values.includes(login);
  }
  async saveLink(longLink: string, shortLink: string): Promise<void> {
    this.shortLinkToLong.set(shortLink, longLink);
  }

  async findLongLink(shortLink: string): Promise<string | undefined> {
    return this.shortLinkToLong.get(shortLink);
  }
}

interface IUser {
  login: string;
  password: string;
}

interface Code {
  login:string;
  message:string;
}