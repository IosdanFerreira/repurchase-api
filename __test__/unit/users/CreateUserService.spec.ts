import AppError from "@shared/errors/AppError";
import CreateUserService from "@modules/users/services/CreateUserService";
import FakeUsersRepository from "../fakes/FakeUsersRepository";

let fakeUsersRepository: FakeUsersRepository;
let createUser: CreateUserService;

describe("CreateUser", () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    createUser = new CreateUserService(fakeUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUser.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
    expect(user.email).toBe("john@example.com");
  });

  it("should not be able to create a user with same email", async () => {
    await createUser.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    await expect(
      createUser.execute({
        name: "Jane Doe",
        email: "john@example.com",
        password: "654321",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
