import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario";
import TokenRefresh from "./TokenRefresh"; // Import the TokenRefresh class.
import TokenAccess from "./TokenAccess"; // Import the TokenAccess class.
import { Authentication } from "./authController"; // Import the login function.

jest.mock("bcrypt", () => ({ compare: jest.fn() })); // Mock the bcrypt module.
jest.mock("../models/Usuario", () => ({ findOne: jest.fn() })); // Mock the Usuario model.
jest.mock("./TokenRefresh", () => ({ cria: jest.fn() })); // Mock the TokenRefresh class.
jest.mock("./TokenAccess", () => ({ cria: jest.fn() })); // Mock the TokenAccess class.
jest.mock("../models/Pessoa", () => ({})); // Mock the Pessoa model.')

describe("login", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        senha: "password",
      },
    };
    res = {
      status: jest.fn().mockImplementation((code)=> console.log(code)),
      json: jest.fn().mockImplementation((code)=> console.log(code)),
    };

    jest.spyOn(TokenAccess, "cria").mockResolvedValue("token");
    jest.spyOn(TokenRefresh, "cria").mockResolvedValue("token");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return an error if email or password is missing", async () => {
    delete req.body.email; // Remove email from the request body.

    jest.spyOn(res, "status"); // Spy on the res.status function.
    jest.spyOn(res, "json"); // Spy on the res.json function.

    await Authentication.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email e senha são obrigatórios.",
    });
  });

//   it("should return an error if user is not found", async () => {
//     jest
//       .spyOn(Usuario, "findOne")
//       .mockImplementationOnce(() => Promise.resolve(null)); // Mock the Usuario model to return null.

//     await Authentication.login(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Usuário não encontrado.",
//     });
//   });

//   it("should return an error if password is incorrect", async () => {
//     jest.spyOn(Usuario, "findOne").mockReturnValueOnce({
//       id: 1,
//       email: "test@example.com",
//       senha: "$2a$10$J.EpV/tahrq3HvZrsPcBBuKzOf/B1R9XQzIk6UOzqbGyyTmj8S.a6", // Hash of "password".
//     } as any); // Mock the Usuario model to return a user with hashed password.

//     jest
//       .spyOn(bcrypt, "compare")
//       .mockImplementationOnce(() => Promise.resolve(false)); // Mock bcrypt.compare to return false.

//     await Authentication.login(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Email ou senha incorreto!",
//     });
//   });

//   it("should authenticate user and return access and refresh tokens", async () => {
//     jest.spyOn(Usuario, "findOne").mockReturnValueOnce({
//       id: 1,
//       email: "test@example.com",
//       senha: "$2a$10$J.EpV/tahrq3HvZrsPcBBuKzOf/B1R9XQzIk6UOzqbGyyTmj8S.a6",
//       /* ... other required properties */
//     } as any); // Mock the Usuario model to return a user with hashed password.

//     jest
//       .spyOn(bcrypt, "compare")
//       .mockImplementationOnce(() => Promise.resolve(true)); // Mock bcrypt.compare to return true.

//     jest
//       .spyOn(TokenRefresh, "cria")
//       .mockImplementationOnce(() => Promise.resolve("refresh-token")); // Mock TokenRefresh.cria to return a refresh token.
//     jest
//       .spyOn(TokenAccess, "cria")
//       .mockImplementationOnce(() => Promise.resolve("access-token")); // Mock TokenAccess.cria to return an access token.

//     await Authentication.login(req as Request, res as Response);

//     expect(res.json).toHaveBeenCalledWith({
//       auth: true,
//       accessToken: "access-token",
//       refreshToken: "refresh-token",
//     });
//   });

//   it("should log error and return a Server Error status code if an error occurs", async () => {
//     jest
//       .spyOn(Usuario, "findOne")
//       .mockImplementationOnce(() =>
//         Promise.reject(new Error("Database error"))
//       ); // Mock the Usuario model to throw an error.

//     const consoleErrorSpy = jest
//       .spyOn(console, "error")
//       .mockImplementation(() => {}); // Create a spy for console.error.

//     await Authentication.login(req as Request, res as Response);

//     expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("Database error"));
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Erro durante o login." });

//     consoleErrorSpy.mockRestore(); // Restore the original console.error function.
//   });
});
