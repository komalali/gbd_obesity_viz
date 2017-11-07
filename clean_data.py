import pandas as pd
from db_queries import get_location_metadata as glm


def assign_global_rank_by_mean(df):
    """Adds column for global ranking to df."""
    df['global_rank'] = df.sort_values(by='mean')['mean'].rank(ascending=False)
    return df


def assign_super_region_rank_by_mean(df):
    """Adds column for super regional ranking to df."""
    super_regions = df['super_region_name'].unique().tolist()
    temp_df = pd.DataFrame()
    for sr in super_regions:
        super_region_temp = df[df['super_region_name'] == sr]
        super_region_temp['super_region_rank'] = super_region_temp.sort_values(by='mean')['mean'].rank(ascending=False)
        temp_df = temp_df.append(super_region_temp)
    return temp_df


if __name__ == '__main__':
    locations = glm(1, gbd_round_id=2)
    locations = locations[(locations.level == 3)]

    master_data = pd.read_csv('data/master_data.csv')
    master_data = master_data[master_data['year'].isin([1990, 1995, 2000, 2005, 2010, 2013])]
    master_data = master_data[master_data.age_group == '20+ yrs, age-standardized']
    master_data = master_data[master_data.sex_id == 3]
    master_data = master_data[master_data['metric'] == 'obese']
    master_data = pd.merge(master_data, locations, on=['location_id', 'location_name'])
    master_data = master_data[master_data.columns[1:]]

    data = master_data[['location', 'location_name', 'super_region_name', 'region_name', 'year', 'mean']]
    data['mean'] *= 100
    data['mean'] = round(data['mean'], 1)

    result = pd.DataFrame()
    for year in [1990, 1995, 2000, 2005, 2010, 2013]:
        temp_data = data[data.year == year]
        temp_data = assign_global_rank_by_mean(temp_data)
        temp_data = assign_super_region_rank_by_mean(temp_data)
        result = result.append(temp_data)

    result.to_csv('data/data.csv')
