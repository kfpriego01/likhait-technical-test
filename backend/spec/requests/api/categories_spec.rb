require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    context "with valid params" do
      it "creates a new category and returns 201" do
        post "/api/categories", params: { category: { name: "Healthcare" } }

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Healthcare")
        expect(json["id"]).to be_present
      end

      it "persists the category to the database" do
        expect {
          post "/api/categories", params: { category: { name: "Healthcare" } }
        }.to change(Category, :count).by(1)
      end
    end

    context "with invalid params" do
      it "returns 422 when name is missing" do
        post "/api/categories", params: { category: { name: "" } }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "returns 422 when name already exists" do
        Category.create!(name: "Food")
        post "/api/categories", params: { category: { name: "Food" } }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end

      it "returns 422 for duplicate name regardless of case" do
        Category.create!(name: "Food")
        post "/api/categories", params: { category: { name: "food" } }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end

      it "does not persist the category when invalid" do
        expect {
          post "/api/categories", params: { category: { name: "" } }
        }.not_to change(Category, :count)
      end
    end
  end
end