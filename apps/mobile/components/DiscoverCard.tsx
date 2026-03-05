import { View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import type { DiscoverProfile, Profile } from '@/types';
import CompatibilityBadge from './CompatibilityBadge';
import TechTag from './TechTag';
import Card from './Card';
import { Ionicons } from '@expo/vector-icons';

interface DiscoverCardProps {
  profile: DiscoverProfile;
  myProfile: Profile | null;
}

export default function DiscoverCard({ profile, myProfile }: DiscoverCardProps) {
  return (
    <Card style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Text style={{ color: Colors.white, fontSize: 24, fontWeight: '700' }}>
                {profile.display_name}
              </Text>
              <Text style={{ color: Colors.dark[400], fontSize: 18 }}>{profile.age}</Text>
            </View>
            <Text style={{ color: Colors.primary[400], fontWeight: '500', fontSize: 16 }}>
              {profile.role}
            </Text>
            {profile.company && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.dark[400]} />
                <Text style={{ color: Colors.dark[400], fontSize: 14 }}>{profile.company}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="location-outline" size={14} color={Colors.dark[400]} />
              <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
                {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
          <CompatibilityBadge score={profile.compatibility_score} size="lg" />
        </View>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {profile.badges.map((badge) => (
              <View
                key={badge}
                style={{
                  backgroundColor: 'rgba(166, 30, 77, 0.3)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: 'rgba(214, 51, 108, 0.3)',
                }}
              >
                <Text style={{ color: Colors.accent[300], fontSize: 12, fontWeight: '500' }}>{badge}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <Text style={{ color: Colors.dark[300], marginBottom: 16, lineHeight: 22, fontSize: 15 }}>
            {profile.bio}
          </Text>
        )}

        {/* Info grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Experience', value: `${profile.years_experience} years` },
            { label: 'Work Style', value: profile.work_style },
            { label: 'Personality', value: profile.personality },
            { label: 'Looking for', value: profile.matching_mode },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                backgroundColor: 'rgba(33, 37, 41, 0.5)',
                borderRadius: 12,
                padding: 12,
                width: '47%',
              }}
            >
              <Text style={{ color: Colors.dark[500], fontSize: 12, marginBottom: 2 }}>{item.label}</Text>
              <Text style={{ color: Colors.white, fontWeight: '500', fontSize: 14 }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Tech Stack */}
        {profile.tech_stack.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <Ionicons name="code-slash-outline" size={14} color={Colors.dark[400]} />
              <Text style={{ color: Colors.dark[400], fontSize: 14, fontWeight: '500' }}>Tech Stack</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.tech_stack.map((t) => (
                <TechTag
                  key={t}
                  label={t}
                  size="sm"
                  selected={myProfile?.tech_stack?.includes(t)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tools */}
        {profile.favorite_tools.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <Ionicons name="build-outline" size={14} color={Colors.dark[400]} />
              <Text style={{ color: Colors.dark[400], fontSize: 14, fontWeight: '500' }}>Tools</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.favorite_tools.map((t) => (
                <TechTag
                  key={t}
                  label={t}
                  size="sm"
                  variant="accent"
                  selected={myProfile?.favorite_tools?.includes(t)}
                />
              ))}
            </View>
          </View>
        )}

        {/* GitHub Languages */}
        {profile.github_languages.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <Ionicons name="logo-github" size={14} color={Colors.dark[400]} />
              <Text style={{ color: Colors.dark[400], fontSize: 14, fontWeight: '500' }}>
                GitHub Languages
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.github_languages.map((l) => (
                <TechTag key={l} label={l} size="sm" variant="neutral" />
              ))}
            </View>
          </View>
        )}

        {/* Fun Prompts */}
        {profile.prompt_tabs_open && (
          <View
            style={{
              backgroundColor: 'rgba(33, 37, 41, 0.5)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: Colors.primary[400], fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
              "Tabs open right now..."
            </Text>
            <Text style={{ color: Colors.dark[200], fontSize: 14 }}>{profile.prompt_tabs_open}</Text>
          </View>
        )}
        {profile.prompt_toxic_trait && (
          <View
            style={{
              backgroundColor: 'rgba(33, 37, 41, 0.5)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: Colors.accent[400], fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
              "My toxic trait as a developer..."
            </Text>
            <Text style={{ color: Colors.dark[200], fontSize: 14 }}>{profile.prompt_toxic_trait}</Text>
          </View>
        )}
        {profile.prompt_hill_to_die_on && (
          <View
            style={{
              backgroundColor: 'rgba(33, 37, 41, 0.5)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: Colors.green[400], fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
              "The hill I'll die on in tech..."
            </Text>
            <Text style={{ color: Colors.dark[200], fontSize: 14 }}>{profile.prompt_hill_to_die_on}</Text>
          </View>
        )}

        {/* Bottom spacing for action buttons */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </Card>
  );
}
