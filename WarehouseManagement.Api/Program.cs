using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Data;
using WarehouseManagement.Api.Repositories;
using WarehouseManagement.Api.Managers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<SmartWarehouseDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IProductManager, ProductManager>();
builder.Services.AddScoped<ITransactionManager, TransactionManager>();
builder.Services.AddScoped<ILocationManager, LocationManager>();
builder.Services.AddScoped<ICompanyManager, CompanyManager>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => 
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // KURAL: Backend PascalCase dönmeli ve kabul etmeli
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
